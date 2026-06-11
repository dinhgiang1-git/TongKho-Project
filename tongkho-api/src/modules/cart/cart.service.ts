import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCartDto } from "./dto/create-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { InjectModel } from "@nestjs/sequelize";
import { CartModel } from "./model/cart.model";
import { ProductModel } from "../product/model/product.model";
import { Op, Transaction } from "sequelize";

@Injectable()
export class CartService {
	constructor(
		@InjectModel(CartModel) private readonly cartRepository: typeof CartModel,
		@InjectModel(ProductModel) private readonly productRepository: typeof ProductModel,
	) {}

	private async mergeDuplicateCartItems(customerId: number, productId?: number, transaction?: Transaction) {
		const whereOptions: any = { customer_id: customerId };
		if (productId) {
			whereOptions.product_id = productId;
		}

		const cartItems = await this.cartRepository.findAll({
			where: whereOptions,
			order: [
				["product_id", "ASC"],
				["created_at", "ASC"],
				["id", "ASC"],
			],
			transaction,
			lock: transaction?.LOCK.UPDATE,
		});

		const groupedCartItems = cartItems.reduce((acc, item) => {
			const key = Number(item.product_id);
			acc.set(key, [...(acc.get(key) || []), item]);

			return acc;
		}, new Map<number, CartModel[]>());

		for (const items of groupedCartItems.values()) {
			if (items.length < 2) continue;

			const [primaryItem, ...duplicatedItems] = items;
			const totalProductNumber = items.reduce((total, item) => total + Number(item.product_number || 0), 0);
			const duplicatedIds = duplicatedItems.map(item => item.id);

			primaryItem.product_number = totalProductNumber;
			await primaryItem.save({ transaction });

			await this.cartRepository.destroy({
				where: {
					id: {
						[Op.in]: duplicatedIds,
					},
				},
				transaction,
			});
		}
	}

	async create(createCartDto: CreateCartDto, req: any) {
		const { product_id, product_number } = createCartDto;
		const customerId = req?.user?.id;

		if (product_number < 1) {
			throw new BadRequestException("Số lượng sản phẩm phải lớn hơn 1!");
		}

		return await this.cartRepository.sequelize.transaction(async transaction => {
			const foundProduct = await this.productRepository.findByPk(product_id, {
				transaction,
				lock: transaction.LOCK.UPDATE,
			});

			if (!foundProduct) {
				throw new NotFoundException("Sản phẩm không tồn tại!");
			}

			if (foundProduct.quantity < product_number) {
				throw new BadRequestException("Số lượng sản phẩm không đủ!");
			}

			await this.mergeDuplicateCartItems(customerId, product_id, transaction);

			const existingCartItem = await this.cartRepository.findOne({
				where: { customer_id: customerId, product_id: product_id },
				transaction,
				lock: transaction.LOCK.UPDATE,
			});

			if (existingCartItem) {
				const nextProductNumber = Number(existingCartItem.product_number || 0) + product_number;
				if (nextProductNumber > foundProduct.quantity) {
					throw new BadRequestException("Số lượng sản phẩm trong kho không đủ!");
				}

				existingCartItem.product_number = nextProductNumber;
				return await existingCartItem.save({ transaction });
			}

			const totalPrice = product_number * Number(foundProduct.price);

			return await this.cartRepository.create(
				{
					customer_id: customerId,
					product_id: product_id,
					product_number: product_number,
					total_price: totalPrice,
				},
				{ transaction },
			);
		});
	}

	async findAll(req: any) {
		const customerId = req?.user?.id;

		await this.cartRepository.sequelize.transaction(async transaction => {
			await this.mergeDuplicateCartItems(customerId, undefined, transaction);
		});

		const carts = await this.cartRepository.findAll({
			where: { customer_id: customerId },
			order: [["created_at", "DESC"]],
			include: [{ model: ProductModel }],
		});

		return carts;
	}

	findOne(id: number) {
		return `This action returns a #${id} cart`;
	}

	async update(id: number, updateCartDto: UpdateCartDto) {
		const { product_number } = updateCartDto;

		const foundCart = await this.cartRepository.findOne({
			where: { id: id },
		});

		if (!foundCart) {
			throw new NotFoundException("Sản phẩm trong giỏ hàng không tồn tại!");
		}

		const foundProduct = await this.productRepository.findOne({
			where: {
				id: foundCart.product_id,
			},
		});

		if (!foundProduct) {
			throw new NotFoundException("Sản phẩm không tồn tại!");
		}

		const nextProductNumber = product_number ?? foundCart.product_number;

		if (nextProductNumber < 1) {
			throw new BadRequestException("Số lượng sản phẩm phải lớn hơn 1!");
		}

		foundCart.product_number = nextProductNumber;

		if (nextProductNumber > foundProduct.quantity) {
			throw new BadRequestException("Số lượng sản phẩm không đủ!");
		}

		await foundCart.save();
	}

	async remove(id: number) {
		const foundCart = await this.cartRepository.findOne({
			where: { id: id },
		});

		if (!foundCart) {
			throw new NotFoundException("Sản phẩm trong giỏ hàng không tồn tại!");
		}

		await this.cartRepository.destroy({
			where: { id: id },
		});
	}
}
