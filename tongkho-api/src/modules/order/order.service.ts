import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { InjectModel } from "@nestjs/sequelize";
import { OrderModel } from "./model/order.model";
import { OrderDetailModel } from "../order-detail/model/order-detail.model";
import { OrderType } from "./types/order.type";
import { SearchOrderDto } from "./dto/search-order.dto";
import { WhereOptions } from "sequelize";
import { Op } from "sequelize";
import { CancelOrderDto } from "./dto/cancel-order.dto";
import { ProductModel } from "../product/model/product.model";
import { UserModel } from "../user/model/user.model";
import { CartModel } from "../cart/model/cart.model";
import { WarehouseService } from "../warehouse/warehouse.service";
import { UserRoles } from "../user/types/user.type";
import { buildInvoicePdf } from "./invoice-pdf.helper";

@Injectable()
export class OrderService {


	constructor(
		@InjectModel(OrderModel) private readonly orderRepository: typeof OrderModel,
		@InjectModel(OrderDetailModel) private readonly orderDetailRepository: typeof OrderDetailModel,
		@InjectModel(ProductModel) private readonly productRepository: typeof ProductModel,
		@InjectModel(CartModel) private readonly cartRepository: typeof CartModel,
		@InjectModel(UserModel) private readonly userRepository: typeof UserModel,
		private readonly warehouseService: WarehouseService,
	) {}

	private calculateLineTotal(unitPrice: number, quantity: number) {
		return Math.round(unitPrice * quantity);
	}

	private async buildCustomerOrderOwnershipWhere(customerId: number): Promise<WhereOptions> {
		const ownershipConditions: WhereOptions[] = [{ customer_id: { [Op.eq]: customerId } }];
		const customer = await this.userRepository.findByPk(customerId, {
			attributes: ["phone"],
		});

		if (customer?.phone) {
			ownershipConditions.push({ phone: { [Op.eq]: customer.phone } });
		}

		return { [Op.or]: ownershipConditions };
	}

	async create(createOrderDto: CreateOrderDto, customerId?: number) {
		const { items, ...orderData } = createOrderDto;
		console.log("🚀 ~ OrderService ~ create ~ createOrderDto:", createOrderDto);

		// 1. Validate products and check inventory
		const orderItems = [];
		for (const item of items) {
			const product = await this.productRepository.findOne({
				where: { id: item.product_id },
			});

			if (!product) {
				throw new BadRequestException(`Không tìm thấy sản phẩm với ID: ${item.product_id}`);
			}

			// Check product availability
			const availability = await this.warehouseService.checkProductAvailability(
				item.product_id,
				item.product_number,
			);

			if (!availability.is_available) {
				throw new BadRequestException(
					`Không đủ số lượng sản phẩm ${product.name}. Có sẵn: ${availability.available_quantity}, Yêu cầu: ${availability.required_quantity}`,
				);
			}

			orderItems.push({
				product_id: item.product_id,
				product_number: item.product_number,
				price: Number(product.price),
				total_price: this.calculateLineTotal(Number(product.price), item.product_number),
			});
		}

		// 2. Create order and order details in transaction
		return await this.orderRepository.sequelize.transaction(async transaction => {
			// Create order
			const order = await this.orderRepository.create(
				{
				...orderData,
				customer_id: customerId ?? null,
				order_status: OrderType.PENDING,
				payment_method: orderData.payment_method || "COD",
				total_price: orderItems.reduce((sum, item) => sum + item.total_price, 0),
			},
				{ transaction },
			);

			// 3. Deduct inventory
			const inventoryDeduction = await this.warehouseService.deductInventory(
				items.map(item => ({
					product_id: item.product_id,
					quantity: item.product_number,
				})),
				transaction,
			);

			// Create order details after inventory deduction so each detail stores the exact warehouse allocation.
			const orderDetails = await Promise.all(
				orderItems.map((item, index) =>
					this.orderDetailRepository.create(
						{
							order_id: order.id,
							product_id: item.product_id,
							product_number: item.product_number,
							price: item.price,
							warehouse_deductions: inventoryDeduction.details[index]?.warehouse_deductions ?? [],
						},
						{ transaction },
					),
				),
			);

			if (customerId) {
				const cartIds = items
					.map(item => item.cart_id ?? (item as any).id)
					.filter((cartId): cartId is number => Number.isInteger(cartId) && cartId > 0);

				if (cartIds.length > 0) {
					await this.cartRepository.destroy({
						where: {
							id: { [Op.in]: cartIds },
							customer_id: customerId,
						},
						transaction,
					});
				}
			}

			return {
				order,
				order_details: orderDetails,
				inventory_deduction: inventoryDeduction,
			};
		});
	}

	async findAll(dto: SearchOrderDto, req: any) {
		const { from_date, to_date, type } = dto;
		const customerId = req?.user?.id;
		const dateConditions = [];
		const whereOptions: any = await this.buildCustomerOrderOwnershipWhere(customerId);
		if (from_date) {
			dateConditions.push({ [Op.gte]: from_date });
		}
		if (to_date) {
			dateConditions.push({ [Op.lte]: to_date });
		}
		if (dateConditions.length > 0) {
			whereOptions.created_at = { [Op.and]: dateConditions };
		}

		if (type) {
			whereOptions.order_status = { [Op.eq]: type };
		}
		const orders = await this.orderRepository.findAll({
			where: whereOptions,
			include: [{ model: OrderDetailModel, include: [{ model: ProductModel }] }],
			order: [["created_at", "DESC"]],
		});

		return orders;
	}

	async findOne(id: number, customerId?: number) {
		const whereOptions: WhereOptions = { id };
		if (customerId) {
			Object.assign(whereOptions, await this.buildCustomerOrderOwnershipWhere(customerId));
		}

		const foundOrder = await this.orderRepository.findOne({
			where: whereOptions,
			include: [{ model: OrderDetailModel, include: [{ model: ProductModel }] }, { model: UserModel }],
		});

		if (!foundOrder) {
			throw new NotFoundException("Đơn hàng không tồn tại!");
		}

		return foundOrder;
	}

	async generateInvoicePdf(id: number, customerId?: number, phone?: string) {
		const whereOptions: WhereOptions = { id };

		if (customerId) {
			Object.assign(whereOptions, await this.buildCustomerOrderOwnershipWhere(customerId));
		} else if (phone) {
			whereOptions.phone = { [Op.eq]: phone };
		} else {
			throw new BadRequestException("Vui lòng cung cấp số điện thoại đặt hàng để xuất hóa đơn");
		}

		const order = await this.orderRepository.findOne({
			where: whereOptions,
			include: [{ model: OrderDetailModel, include: [{ model: ProductModel }] }, { model: UserModel }],
		});

		if (!order) {
			throw new NotFoundException("Đơn hàng không tồn tại!");
		}

		return buildInvoicePdf(order);
	}

	async cancelOrder(id: number, dto: CancelOrderDto, user?: any) {
		const whereOptions: WhereOptions = { id };
		if (user?.role === UserRoles.CUSTOMER) {
			Object.assign(whereOptions, await this.buildCustomerOrderOwnershipWhere(user.id));
		}

		await this.orderRepository.sequelize.transaction(async transaction => {
			const foundOrder = await this.orderRepository.findOne({
				where: whereOptions,
				include: [{ model: OrderDetailModel }],
				transaction,
				lock: transaction.LOCK.UPDATE,
			});

			if (!foundOrder) {
				throw new NotFoundException("Đơn hàng không tồn tại!");
			}

			if (foundOrder.order_status === OrderType.CANCELED) {
				throw new BadRequestException("Đơn hàng đã bị hủy!");
			}

			await this.warehouseService.restoreInventory(
				foundOrder.order_details.map(item => ({
					product_id: item.product_id,
					quantity: item.product_number,
					warehouse_deductions: item.warehouse_deductions,
				})),
				transaction,
			);

			await this.orderRepository.update(
				{
					order_status: OrderType.CANCELED,
					cancel_reason: dto.cancel_reason,
				},
				{ where: { id: id }, transaction },
			);
		});
	}
}
