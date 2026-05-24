import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { WarehouseModel } from "./model/warehouse.model";
import { CreateWarehouseDto } from "./dto/create-warehouse.dto";
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto";
import { SearchWarehouseDto } from "./dto/search-warehouse.dto";
import { Transaction, WhereOptions } from "sequelize";
import { Op } from "sequelize";
import { PageMetaDto } from "src/common/dto/page-meta.dto";
import { PageDto } from "src/common/dto/page.dto";
import { ImportProductDto } from "./dto/import-product.dto";
import { ProductModel } from "src/modules/product/model/product.model";
import { ProductWarehouseModel } from "src/modules/product-warehouse/model/product-warehouse.model";
import { SearchImportDto } from "./dto/search-import.dto";
import { WarehouseImportHistoryModel } from "./model/warehouse-import-history.model";
import { SupplierModel } from "src/modules/supplier/model/supplier.model";

interface OrderItem {
	product_id: number;
	quantity: number;
}

@Injectable()
export class WarehouseService {
	constructor(
		@InjectModel(WarehouseModel) private readonly warehouseRepository: typeof WarehouseModel,
		@InjectModel(ProductModel) private readonly productRepository: typeof ProductModel,
		@InjectModel(ProductWarehouseModel) private readonly productWarehouseRepository: typeof ProductWarehouseModel,
		@InjectModel(WarehouseImportHistoryModel) private readonly importHistoryRepository: typeof WarehouseImportHistoryModel,
		@InjectModel(SupplierModel) private readonly supplierRepository: typeof SupplierModel,
	) {}

	async create(createWarehouseDto: CreateWarehouseDto): Promise<WarehouseModel> {
		const { warehouse_code, warehouse_name, total_warehouse_area } = createWarehouseDto;

		return await this.warehouseRepository.create({
			warehouse_code,
			warehouse_name,
			total_warehouse_area,
		});
	}

	async findAll(dto: SearchWarehouseDto) {
		const { q, status, from_date, to_date, take, skip } = dto;
		const whereOptions: WhereOptions = {};
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
		const warehouse = await this.warehouseRepository.findOne({
			where: { id },
		});

		if (!warehouse) {
			throw new NotFoundException("Không tìm thấy kho");
		}

		return warehouse;
	}

	async update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
		const warehouse = await this.findOne(id);

		await this.warehouseRepository.update(
			{
				...updateWarehouseDto,
			},
			{
				where: { id },
			}
		);

		return await this.findOne(id);
	}

	async remove(id: number) {
		const warehouse = await this.findOne(id);
		await warehouse.destroy();
		return { message: "Xóa kho thành công" };
	}

	async importProducts(dto: ImportProductDto) {
		const { warehouse_id, products, staff_name, staff_id, import_date, supplier_id } = dto;

		// Check if warehouse exists
		const warehouse = await this.warehouseRepository.findOne({
			where: { id: warehouse_id },
		});

		if (!warehouse) {
			throw new NotFoundException("Không tìm thấy kho");
		}
		
		// Check if supplier exists if provided
		if (supplier_id) {
			const supplier = await this.supplierRepository.findByPk(supplier_id);
			if (!supplier) {
				throw new NotFoundException(`Không tìm thấy nhà cung cấp với ID: ${supplier_id}`);
			}
		}

		// Process imports within a transaction
		return await this.warehouseRepository.sequelize.transaction(async (transaction) => {
			const importResults = [];

			for (const product of products) {
				const { product_id, quantity, note } = product;

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
				await existingProduct.increment("quantity", { by: quantity, transaction });

				// Record import history
				const importHistory = await this.importHistoryRepository.create({
					product_id,
					warehouse_id,
					quantity,
					staff_name,
					staff_id,
					import_date,
					note,
					supplier_id,
				}, { transaction });

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

		if(supplier_id) {
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
					attributes: ['id', 'product_code', 'name', 'image'],
				},
				{
					model: WarehouseModel,
					attributes: ['id', 'warehouse_code', 'warehouse_name'],
				},
				{
					model: SupplierModel,
					attributes: ['id', 'supplier_code', 'supplier_name'],
				}
			],
			order: [["import_date", "DESC"]],
			limit: take,
			offset: skip,
		});

		return new PageDto(imports.rows, new PageMetaDto({ itemCount: imports.count, pageOptionsDto: dto }));
	}

async deductInventory(orderItems: OrderItem[], transaction: Transaction) {
  const deductionResults = [];

  for (const item of orderItems) {
    const { product_id, quantity } = item;

    // Kiểm tra sản phẩm có tồn tại không, lock dòng lại để tránh bị cập nhật song song
    const product = await this.productRepository.findOne({
      where: { id: product_id },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${product_id}`);
    }

    // Lấy danh sách kho còn hàng của sản phẩm, ưu tiên kho nhiều hàng trước
    const productWarehouses = await this.productWarehouseRepository.findAll({
      where: {
        product_id,
        quantity: { [Op.gt]: 0 }
      },
      include: [{
        model: WarehouseModel,
        attributes: ['id', 'warehouse_name']
      }],
      order: [['quantity', 'DESC']],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (productWarehouses.length === 0) {
      if (product.quantity < quantity) {
        throw new BadRequestException(`Sản phẩm ${product.name} không còn tồn kho`);
      }

      await product.update({
        quantity: this.productRepository.sequelize.literal(`quantity - ${quantity}`)
      }, { transaction });

      deductionResults.push({
        product_id,
        product_name: product.name,
        quantity,
        warehouse_deductions: []
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
      await pw.update({
        quantity: pw.quantity - deductAmount
      }, { transaction });

      warehouseDeductions.push({
        warehouse_id: pw.warehouse_id,
        warehouse_name: pw.warehouse.warehouse_name,
        deducted_quantity: deductAmount
      });

      remainingQuantity -= deductAmount;
    }

    // Nếu vẫn chưa đủ hàng => báo lỗi
    if (remainingQuantity > 0) {
      throw new BadRequestException(`Không đủ số lượng sản phẩm ${product.name} trong kho`);
    }

    // Cập nhật tổng tồn kho của sản phẩm (dùng literal để tránh conflict khi có giao dịch đồng thời)
    await product.update({
      quantity: this.productRepository.sequelize.literal(`quantity - ${quantity}`)
    }, { transaction });

    deductionResults.push({
      product_id,
      product_name: product.name,
      quantity,
      warehouse_deductions: warehouseDeductions
    });
  }

  return {
    message: "Trừ tồn kho thành công",
    details: deductionResults
  };
}

	async restoreInventory(orderItems: OrderItem[], transaction: Transaction) {
		const restoreResults = [];

		for (const item of orderItems) {
			const { product_id, quantity } = item;
			const product = await this.productRepository.findOne({
				where: { id: product_id },
				transaction,
				lock: transaction.LOCK.UPDATE,
			});

			if (!product) {
				throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${product_id}`);
			}

			const productWarehouse = await this.productWarehouseRepository.findOne({
				where: { product_id },
				order: [["quantity", "DESC"]],
				transaction,
				lock: transaction.LOCK.UPDATE,
			});

			if (!productWarehouse) {
				await product.increment("quantity", { by: quantity, transaction });

				restoreResults.push({
					product_id,
					product_name: product.name,
					quantity,
					warehouse_id: null,
				});

				continue;
			}

			await productWarehouse.increment("quantity", { by: quantity, transaction });
			await product.increment("quantity", { by: quantity, transaction });

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
		const warehouseCount = await this.productWarehouseRepository.count({
			where: { product_id },
		});
		const totalAvailable = warehouseCount > 0
			? await this.productWarehouseRepository.sum('quantity', { where: { product_id } })
			: null;
		const availableQuantity = totalAvailable ?? (await this.productRepository.findByPk(product_id))?.quantity ?? 0;

		return {
			is_available: availableQuantity >= required_quantity,
			available_quantity: availableQuantity,
			required_quantity
		};
	}
}
