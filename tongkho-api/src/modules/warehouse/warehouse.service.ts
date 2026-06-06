import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { WarehouseModel } from "./model/warehouse.model";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import { SearchWarehouseDto } from "./dto/search-warehouse.dto";
import { QueryTypes, Transaction, WhereOptions } from "sequelize";
import { Op } from "sequelize";
import { PageMetaDto } from "src/common/dto/page-meta.dto";
import { PageDto } from "src/common/dto/page.dto";
import { ImportProductDto } from "./dto/import-product.dto";
import { ProductModel } from "src/modules/product/model/product.model";
import { ProductWarehouseModel } from "src/modules/product-warehouse/model/product-warehouse.model";
import { SearchImportDto } from "./dto/search-import.dto";
import { WarehouseImportHistoryModel } from "./model/warehouse-import-history.model";
import { SupplierModel } from "src/modules/supplier/model/supplier.model";
import { UpdateImportStatusDto } from "./dto/update-import-status.dto";
import { WarehouseImportStatus } from "./constants/warehouse-import.constant";

interface OrderItem {
	product_id: number;
	quantity: number;
	warehouse_deductions?: WarehouseDeduction[] | string;
}

interface WarehouseDeduction {
	warehouse_id: number;
	warehouse_name?: string;
	deducted_quantity: number;
}

@Injectable()
export class WarehouseService {
	constructor(
		@InjectModel(WarehouseModel) private readonly warehouseRepository: typeof WarehouseModel,
		@InjectModel(ProductModel) private readonly productRepository: typeof ProductModel,
		@InjectModel(ProductWarehouseModel) private readonly productWarehouseRepository: typeof ProductWarehouseModel,
		@InjectModel(WarehouseImportHistoryModel)
		private readonly importHistoryRepository: typeof WarehouseImportHistoryModel,
		@InjectModel(SupplierModel) private readonly supplierRepository: typeof SupplierModel,
	) {}

	private normalizeWarehouseDeductions(warehouseDeductions?: WarehouseDeduction[] | string): WarehouseDeduction[] {
		if (!warehouseDeductions) {
			return [];
		}

		if (typeof warehouseDeductions === "string") {
			try {
				const parsed = JSON.parse(warehouseDeductions);
				return Array.isArray(parsed) ? parsed : [];
			} catch {
				return [];
			}
		}

		return Array.isArray(warehouseDeductions) ? warehouseDeductions : [];
	}

	private getSoldUpdateLiteral(delta: number) {
		const operator = delta >= 0 ? "+" : "-";
		const amount = Math.abs(delta);

		return this.productRepository.sequelize.literal(`GREATEST(COALESCE(sold, 0) ${operator} ${amount}, 0)`);
	}

	private async hasWarehouseInventory(productId: number, transaction?: Transaction) {
		const count = await this.productWarehouseRepository.count({
			where: { product_id: productId },
			transaction,
		});

		return count > 0;
	}

	private async getWarehouseInventoryQuantity(productId: number, transaction?: Transaction) {
		const totalQuantity = await this.productWarehouseRepository.sum("quantity", {
			where: { product_id: productId },
			transaction,
		});

		return Number(totalQuantity || 0);
	}

	private async ensurePrimaryWarehouse(transaction?: Transaction) {
		const warehouse = await this.warehouseRepository.findOne({
			order: [["id", "ASC"]],
			transaction,
			lock: transaction?.LOCK.UPDATE,
		});

		if (warehouse) {
			return warehouse;
		}

		return await this.warehouseRepository.create(
			{
				warehouse_code: "KHO-CHINH",
				warehouse_name: "Kho chính",
				total_warehouse_area: 0,
			},
			{ transaction },
		);
	}

	async getPrimaryWarehouse(transaction?: Transaction) {
		return await this.ensurePrimaryWarehouse(transaction);
	}

	async reconcileSingleWarehouseInventory(transaction?: Transaction) {
		const run = async (activeTransaction: Transaction) => {
			const primaryWarehouse = await this.ensurePrimaryWarehouse(activeTransaction);
			const warehouseTotals = await this.productWarehouseRepository.sequelize.query<{
				product_id: number;
				total_quantity: string;
			}>(
				`
				SELECT product_id, COALESCE(SUM(quantity), 0) AS total_quantity
				FROM product_warehouse
				WHERE deleted_at IS NULL
				GROUP BY product_id
				`,
				{
					type: QueryTypes.SELECT,
					transaction: activeTransaction,
				},
			);
			const totalByProductId = new Map(
				warehouseTotals.map(item => [Number(item.product_id), Number(item.total_quantity || 0)]),
			);
			const products = await this.productRepository.findAll({
				attributes: ["id", "quantity"],
				transaction: activeTransaction,
				lock: activeTransaction.LOCK.UPDATE,
			});
			const warehouseRows = products.map(product => {
				const productId = Number(product.id);
				const quantity = totalByProductId.has(productId)
					? totalByProductId.get(productId)
					: Number(product.quantity || 0);

				return {
					product_id: productId,
					warehouse_id: primaryWarehouse.id,
					quantity: Number(quantity || 0),
				};
			});
			const nonPrimaryInventoryCount = await this.productWarehouseRepository.count({
				where: {
					warehouse_id: { [Op.ne]: primaryWarehouse.id },
				},
				transaction: activeTransaction,
			});

			if (nonPrimaryInventoryCount > 0) {
				await this.productWarehouseRepository.destroy({
					where: { id: { [Op.ne]: null } },
					transaction: activeTransaction,
				});

				if (warehouseRows.length > 0) {
					await this.productWarehouseRepository.bulkCreate(warehouseRows, {
						transaction: activeTransaction,
					});
				}
			} else {
				for (const row of warehouseRows) {
					const productWarehouse = await this.productWarehouseRepository.findOne({
						where: {
							product_id: row.product_id,
							warehouse_id: primaryWarehouse.id,
						},
						transaction: activeTransaction,
						lock: activeTransaction.LOCK.UPDATE,
					});

					if (productWarehouse) {
						await productWarehouse.update({ quantity: row.quantity }, { transaction: activeTransaction });
					} else {
						await this.productWarehouseRepository.create(row, { transaction: activeTransaction });
					}
				}
			}

			for (const row of warehouseRows) {
				await this.productRepository.update(
					{ quantity: row.quantity },
					{
						where: { id: row.product_id },
						transaction: activeTransaction,
					},
				);
			}

			return {
				warehouse: primaryWarehouse,
				total_products: warehouseRows.length,
				total_quantity: warehouseRows.reduce((sum, item) => sum + item.quantity, 0),
			};
		};

		if (transaction) {
			return await run(transaction);
		}

		return await this.warehouseRepository.sequelize.transaction(run);
	}

	async syncProductQuantityFromWarehouses(productId: number, transaction?: Transaction) {
		if (!(await this.hasWarehouseInventory(productId, transaction))) {
			return null;
		}

		const totalQuantity = await this.getWarehouseInventoryQuantity(productId, transaction);

		await this.productRepository.update(
			{ quantity: totalQuantity },
			{
				where: { id: productId },
				transaction,
			},
		);

		return totalQuantity;
	}

	async create(createWarehouseDto: CreateWarehouseDto): Promise<WarehouseModel> {
		const { warehouse_code, warehouse_name, total_warehouse_area } = createWarehouseDto;
		const count = await this.warehouseRepository.count();

		if (count > 0) {
			throw new BadRequestException("Tạm thời hệ thống chỉ hỗ trợ một nhà kho");
		}

		return await this.warehouseRepository.create({
			warehouse_code,
			warehouse_name,
			total_warehouse_area,
		});
	}

	async findAll(dto: SearchWarehouseDto) {
		const { warehouse } = await this.reconcileSingleWarehouseInventory();
		const { q, status, from_date, to_date, take, skip } = dto;
		const whereOptions: WhereOptions = { id: warehouse.id };
		const dateConditions = [];

		// if (q) {
		// 	whereOptions[Op.or] = [
		// 		{ warehouse_code: { [Op.like]: `%${q}%` } },
		// 		{ warehouse_name: { [Op.like]: `%${q}%` } }
		// 	];
		// }

		if (status !== undefined) {
			whereOptions.status = { [Op.eq]: status };
		}

		if (from_date) {
			dateConditions.push({
				[Op.gte]: from_date,
			});
		}
		if (to_date) {
			dateConditions.push({ [Op.lte]: to_date });
		}
		if (dateConditions.length > 0) {
			whereOptions.created_at = { [Op.and]: dateConditions };
		}

		const warehouses = await this.warehouseRepository.findAndCountAll({
			where: whereOptions,
			order: [["created_at", "DESC"]],
			limit: take,
			offset: skip,
		});

		return new PageDto(warehouses.rows, new PageMetaDto({ itemCount: warehouses.count, pageOptionsDto: dto }));
	}

	async findOne(id: number) {
		const primaryWarehouse = await this.getPrimaryWarehouse();

		if (id !== primaryWarehouse.id) {
			throw new NotFoundException("Tạm thời hệ thống chỉ sử dụng kho chính");
		}

		const warehouse = await this.warehouseRepository.findOne({
			where: { id },
		});

		if (!warehouse) {
			throw new NotFoundException("Không tìm thấy kho");
		}

		return warehouse;
	}

	async update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
		await this.findOne(id);

		await this.warehouseRepository.update(
			{
				...updateWarehouseDto,
			},
			{
				where: { id },
			},
		);

		return await this.findOne(id);
	}

	async remove(id: number) {
		await this.findOne(id);
		throw new BadRequestException("Không thể xóa kho chính khi hệ thống đang ở chế độ một nhà kho");
	}

	async importProducts(dto: ImportProductDto) {
		const { products, staff_name, staff_id, import_date, supplier_id } = dto;

		const warehouse = await this.getPrimaryWarehouse();
		const warehouse_id = warehouse.id;

		// Check if supplier exists if provided
		if (supplier_id) {
			const supplier = await this.supplierRepository.findByPk(supplier_id);
			if (!supplier) {
				throw new NotFoundException(`Không tìm thấy nhà cung cấp với ID: ${supplier_id}`);
			}
		}

		// Process imports within a transaction
		return await this.warehouseRepository.sequelize.transaction(async transaction => {
			await this.reconcileSingleWarehouseInventory(transaction);
			const importResults = [];

			for (const product of products) {
				const { product_id, quantity, note } = product;

				if (!Number.isInteger(quantity) || quantity <= 0) {
					throw new BadRequestException(`Số lượng nhập của sản phẩm ${product_id} phải là số nguyên dương`);
				}

				// Check if product exists
				const existingProduct = await this.productRepository.findOne({
					where: { id: product_id },
					transaction,
					lock: transaction.LOCK.UPDATE,
				});

				if (!existingProduct) {
					throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${product_id}`);
				}

				// Find or create product-warehouse relationship
				const [productWarehouse, created] = await this.productWarehouseRepository.findOrCreate({
					where: {
						product_id,
						warehouse_id,
					},
					defaults: {
						quantity: 0,
					},
					transaction,
				});

				await productWarehouse.increment("quantity", { by: quantity, transaction });
				await this.syncProductQuantityFromWarehouses(product_id, transaction);

				// Record import history
				const importHistory = await this.importHistoryRepository.create(
					{
						product_id,
						warehouse_id,
						quantity,
						staff_name,
						staff_id,
						import_date,
						note,
						supplier_id,
						status: WarehouseImportStatus.PROCESSING,
					},
					{ transaction },
				);

				importResults.push({
					product: existingProduct.name,
					quantity,
					note,
					import_date,
				});
			}

			return {
				message: "Nhập kho thành công",
				details: importResults,
			};
		});
	}

	async getImportHistory(dto: SearchImportDto) {
		const { warehouse_id, staff_name, from_date, to_date, take, skip, supplier_id } = dto;
		const whereOptions: WhereOptions = {};
		const dateConditions = [];

		if (warehouse_id) {
			whereOptions.warehouse_id = { [Op.eq]: warehouse_id };
		}

		if (staff_name) {
			whereOptions.staff_name = { [Op.like]: `%${staff_name}%` };
		}

		if (supplier_id) {
			whereOptions.supplier_id = { [Op.eq]: supplier_id };
		}

		if (from_date) {
			dateConditions.push({
				[Op.gte]: from_date,
			});
		}
		if (to_date) {
			dateConditions.push({ [Op.lte]: to_date });
		}
		if (dateConditions.length > 0) {
			whereOptions.import_date = { [Op.and]: dateConditions };
		}

		const imports = await this.importHistoryRepository.findAndCountAll({
			where: whereOptions,
			include: [
				{
					model: ProductModel,
					attributes: ["id", "product_code", "name", "image"],
				},
				{
					model: WarehouseModel,
					attributes: ["id", "warehouse_code", "warehouse_name"],
				},
				{
					model: SupplierModel,
					attributes: ["id", "supplier_code", "supplier_name"],
				},
			],
			order: [["import_date", "DESC"]],
			limit: take,
			offset: skip,
		});

		return new PageDto(imports.rows, new PageMetaDto({ itemCount: imports.count, pageOptionsDto: dto }));
	}

	async updateImportStatus(id: number, dto: UpdateImportStatusDto) {
		const importHistory = await this.importHistoryRepository.findByPk(id);

		if (!importHistory) {
			throw new NotFoundException("Không tìm thấy lịch sử nhập kho");
		}

		await importHistory.update({
			status: dto.status,
		});

		return importHistory;
	}

	async deductInventory(orderItems: OrderItem[], transaction: Transaction) {
		await this.reconcileSingleWarehouseInventory(transaction);
		const deductionResults = [];

		for (const item of orderItems) {
			const { product_id, quantity } = item;

			if (!Number.isInteger(quantity) || quantity <= 0) {
				throw new BadRequestException(`Số lượng sản phẩm ${product_id} phải là số nguyên dương`);
			}

			// Kiểm tra sản phẩm có tồn tại không, lock dòng lại để tránh bị cập nhật song song
			const product = await this.productRepository.findOne({
				where: { id: product_id },
				transaction,
				lock: transaction.LOCK.UPDATE,
			});

			if (!product) {
				throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${product_id}`);
			}

			// Lấy danh sách kho còn hàng của sản phẩm, ưu tiên kho nhiều hàng trước
			const productWarehouses = await this.productWarehouseRepository.findAll({
				where: {
					product_id,
					quantity: { [Op.gt]: 0 },
				},
				include: [
					{
						model: WarehouseModel,
						attributes: ["id", "warehouse_name"],
					},
				],
				order: [["quantity", "DESC"]],
				transaction,
				lock: transaction.LOCK.UPDATE,
			});

			if (productWarehouses.length === 0) {
				if (await this.hasWarehouseInventory(product_id, transaction)) {
					throw new BadRequestException(`Sản phẩm ${product.name} không còn tồn kho`);
				}

				if (product.quantity < quantity) {
					throw new BadRequestException(`Sản phẩm ${product.name} không còn tồn kho`);
				}

				await product.update(
					{
						quantity: this.productRepository.sequelize.literal(`quantity - ${quantity}`),
						sold: this.getSoldUpdateLiteral(quantity),
					},
					{ transaction },
				);

				deductionResults.push({
					product_id,
					product_name: product.name,
					quantity,
					warehouse_deductions: [],
				});

				continue;
			}

			let remainingQuantity = quantity;
			const warehouseDeductions = [];

			// Trừ tồn kho từ các kho hàng theo thứ tự ưu tiên
			for (const pw of productWarehouses) {
				if (remainingQuantity <= 0) break;

				const deductAmount = Math.min(remainingQuantity, pw.quantity);

				// Cập nhật tồn kho của kho cụ thể
				await pw.update(
					{
						quantity: pw.quantity - deductAmount,
					},
					{ transaction },
				);

				warehouseDeductions.push({
					warehouse_id: pw.warehouse_id,
					warehouse_name: pw.warehouse.warehouse_name,
					deducted_quantity: deductAmount,
				});

				remainingQuantity -= deductAmount;
			}

			// Nếu vẫn chưa đủ hàng => báo lỗi
			if (remainingQuantity > 0) {
				throw new BadRequestException(`Không đủ số lượng sản phẩm ${product.name} trong kho`);
			}

			await product.update(
				{
					sold: this.getSoldUpdateLiteral(quantity),
				},
				{ transaction },
			);
			await this.syncProductQuantityFromWarehouses(product_id, transaction);

			deductionResults.push({
				product_id,
				product_name: product.name,
				quantity,
				warehouse_deductions: warehouseDeductions,
			});
		}

		return {
			message: "Trừ tồn kho thành công",
			details: deductionResults,
		};
	}

	async restoreInventory(orderItems: OrderItem[], transaction: Transaction) {
		await this.reconcileSingleWarehouseInventory(transaction);
		const primaryWarehouse = await this.getPrimaryWarehouse(transaction);
		const restoreResults = [];

		for (const item of orderItems) {
			const { product_id, quantity } = item;
			const warehouseDeductions = this.normalizeWarehouseDeductions(item.warehouse_deductions);

			if (!Number.isInteger(quantity) || quantity <= 0) {
				throw new BadRequestException(`Số lượng sản phẩm ${product_id} phải là số nguyên dương`);
			}

			const product = await this.productRepository.findOne({
				where: { id: product_id },
				transaction,
				lock: transaction.LOCK.UPDATE,
			});

			if (!product) {
				throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${product_id}`);
			}

			if (warehouseDeductions.length > 0) {
				const restoredQuantity = warehouseDeductions.reduce((sum, deduction) => {
					if (
						!Number.isInteger(deduction.warehouse_id) ||
						deduction.warehouse_id <= 0 ||
						!Number.isInteger(deduction.deducted_quantity) ||
						deduction.deducted_quantity <= 0
					) {
						throw new BadRequestException(`Dữ liệu kho đã trừ của sản phẩm ${product_id} không hợp lệ`);
					}

					return sum + deduction.deducted_quantity;
				}, 0);

				if (restoredQuantity !== quantity) {
					throw new BadRequestException(
						`Dữ liệu hoàn kho của sản phẩm ${product_id} không khớp số lượng đơn hàng`,
					);
				}

				const warehouseRestores = [];

				for (const deduction of warehouseDeductions) {
					const [productWarehouse] = await this.productWarehouseRepository.findOrCreate({
						where: {
							product_id,
							warehouse_id: primaryWarehouse.id,
						},
						defaults: {
							quantity: 0,
						},
						transaction,
						lock: transaction.LOCK.UPDATE,
					});

					await productWarehouse.increment("quantity", {
						by: deduction.deducted_quantity,
						transaction,
					});

					warehouseRestores.push({
						warehouse_id: primaryWarehouse.id,
						warehouse_name: primaryWarehouse.warehouse_name,
						restored_quantity: deduction.deducted_quantity,
					});
				}

				await product.update(
					{
						sold: this.getSoldUpdateLiteral(-restoredQuantity),
					},
					{ transaction },
				);
				await this.syncProductQuantityFromWarehouses(product_id, transaction);

				restoreResults.push({
					product_id,
					product_name: product.name,
					quantity: restoredQuantity,
					warehouse_restores: warehouseRestores,
				});

				continue;
			}

			const productWarehouse = await this.productWarehouseRepository.findOne({
				where: { product_id, warehouse_id: primaryWarehouse.id },
				order: [["quantity", "DESC"]],
				transaction,
				lock: transaction.LOCK.UPDATE,
			});

			if (!productWarehouse) {
				await product.update(
					{
						quantity: this.productRepository.sequelize.literal(`quantity + ${quantity}`),
						sold: this.getSoldUpdateLiteral(-quantity),
					},
					{ transaction },
				);

				restoreResults.push({
					product_id,
					product_name: product.name,
					quantity,
					warehouse_id: null,
				});

				continue;
			}

			await productWarehouse.increment("quantity", { by: quantity, transaction });
			await product.update(
				{
					sold: this.getSoldUpdateLiteral(-quantity),
				},
				{ transaction },
			);
			await this.syncProductQuantityFromWarehouses(product_id, transaction);

			restoreResults.push({
				product_id,
				product_name: product.name,
				quantity,
				warehouse_id: productWarehouse.warehouse_id,
			});
		}

		return {
			message: "Hoàn tồn kho thành công",
			details: restoreResults,
		};
	}

	// Helper method to check product availability
	async checkProductAvailability(product_id: number, required_quantity: number) {
		await this.reconcileSingleWarehouseInventory();
		const hasWarehouseInventory = await this.hasWarehouseInventory(product_id);
		const totalAvailable = hasWarehouseInventory ? await this.getWarehouseInventoryQuantity(product_id) : null;
		const availableQuantity = totalAvailable ?? (await this.productRepository.findByPk(product_id))?.quantity ?? 0;

		return {
			is_available: availableQuantity >= required_quantity,
			available_quantity: availableQuantity,
			required_quantity,
		};
	}
}
