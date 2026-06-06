import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { InjectModel } from "@nestjs/sequelize";
import { ProductModel } from "../model/product.model";
import { ProductPhotoModel } from "src/modules/product-photo/model/product-photo.model";
import { CategoryModel } from "src/modules/category/model/category.model";
import { SearchProductDto } from "../dto/search-product.dto";
import { Sequelize, Transaction, WhereOptions } from "sequelize";
import { Op } from "sequelize";
import { PageDto } from "src/common/dto/page.dto";
import { PageMetaDto } from "src/common/dto/page-meta.dto";
import { ImportProductDto } from "../dto/import-product.dto";
import * as ExcelJS from "exceljs";
import { format } from "date-fns";
import { convertStatus } from "src/common/helpers/ultils";
import { SupplierModel } from "src/modules/supplier/model/supplier.model";
import { ProductWarehouseModel } from "src/modules/product-warehouse/model/product-warehouse.model";
import { ProductStatus } from "../constants/product.constant";

@Injectable()
export class ProductAdminService {
	constructor(
		@InjectModel(ProductModel) private readonly productRepository: typeof ProductModel,
		@InjectModel(ProductPhotoModel) private productPhotoModel: typeof ProductModel,
		@InjectModel(CategoryModel) private categoryRepository: typeof CategoryModel,
		@InjectModel(ProductWarehouseModel) private productWarehouseRepository: typeof ProductWarehouseModel,
	) {}

	private async hasWarehouseInventory(productId: number, transaction?: Transaction) {
		const count = await this.productWarehouseRepository.count({
			where: { product_id: productId },
			transaction,
		});

		return count > 0;
	}

	private async syncProductQuantityFromWarehouses(productId: number, transaction?: Transaction) {
		const totalQuantity = await this.productWarehouseRepository.sum("quantity", {
			where: { product_id: productId },
			transaction,
		});

		await this.productRepository.update(
			{ quantity: Number(totalQuantity || 0) },
			{
				where: { id: productId },
				transaction,
			},
		);
	}

	private async syncAllWarehouseManagedProductQuantities() {
		await this.productRepository.sequelize.query(`
			UPDATE product p
			JOIN (
				SELECT product_id, COALESCE(SUM(quantity), 0) AS total_quantity
				FROM product_warehouse
				WHERE deleted_at IS NULL
				GROUP BY product_id
			) pw ON pw.product_id = p.id
			SET p.quantity = pw.total_quantity
			WHERE p.deleted_at IS NULL
		`);
	}

	generateProductCode() {
		const now = new Date();
		const datePart = now.toISOString().split("T")[0].replace(/-/g, ""); // Lấy ngày YYYYMMDD
		const recordPart = String(Math.floor(10000 + Math.random() * 90000)); // Sinh số ngẫu nhiên 5 chữ số

		return `SP-${datePart}-${recordPart}`;
	}

	async create(createProductDto: CreateProductDto) {
		const {
			name,
			category_id,
			price,
			product_type,
			quantity,
			product_photo,
			description,
			image,
			introduce,
			supplier_id,
			status = ProductStatus.ACTIVE,
		} = createProductDto;

		if (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 0)) {
			throw new BadRequestException("Số lượng sản phẩm không được âm");
		}

		const foundCategory = await this.categoryRepository.findOne({
			where: { id: category_id },
		});

		if (!foundCategory) {
			throw new NotFoundException("Không tồn tại danh mục!");
		}

		const product = await this.productRepository.sequelize.transaction(async transaction => {
			const newProduct = await this.productRepository.create(
				{
					product_code: this.generateProductCode(),
					name,
					category_id,
					price,
					product_type,
					quantity,
					description,
					image,
					introduce,
					supplier_id,
					status,
				},
				{ transaction },
			);
			if (product_photo && product_photo.length > 0) {
				const payloadProductPhoto = product_photo.map(item => {
					return {
						product_id: newProduct.id,
						url: item.url,
					};
				});

				await this.productPhotoModel.bulkCreate(payloadProductPhoto, { transaction });
			}
			return newProduct;
		});

		return product;
	}

	async findAll(dto: SearchProductDto) {
		const { product_type, q, status, from_date, to_date, brand, order_price } = dto;
		console.log("🚀 ~ ProductAdminService ~ findAll ~ order_price:", order_price);
		await this.syncAllWarehouseManagedProductQuantities();
		const whereOptions: WhereOptions = {};
		const dateConditions = [];
		let orderConditions: [string, "ASC" | "DESC"][] = [["created_at", "DESC"]];

		if (q) {
			whereOptions.id = {
				[Op.in]: [
					Sequelize.literal(`
          select product.id from product
          where product.name like '%${q}%'
          or product.product_code like '%${q}%'`),
				],
			};
		}

		if (product_type) {
			whereOptions.product_type = { [Op.eq]: product_type };
		}

		if (status !== undefined) {
			whereOptions.status = { [Op.eq]: status };
		}

		if (brand) {
			console.log("🚀 ~ ProductAdminService ~ findAll ~ brand:", brand);
			whereOptions.category_id = { [Op.eq]: brand };
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

		if (order_price === "ASC" || order_price === "DESC") {
			orderConditions = [["price", order_price]];
			console.log("🚀 ~ ProductAdminService ~ findAll ~ orderConditions:", orderConditions);
		}

		const products = await this.productRepository.findAndCountAll({
			where: whereOptions,
			include: [{ model: CategoryModel }, { model: ProductPhotoModel }, { model: SupplierModel }],
			order: orderConditions,
			distinct: true,
			limit: dto.take,
			offset: dto.skip,
		});

		return new PageDto(products.rows, new PageMetaDto({ itemCount: products.count, pageOptionsDto: dto }));
	}

	async findOne(productId: number) {
		const product = await this.productRepository.findOne({
			where: { id: productId },
			include: [{ model: ProductPhotoModel }],
		});

		if (!product) {
			throw new NotFoundException("Không tồn tại sản phẩm!");
		}

		return product;
	}

	async update(productId: number, updateProductDto: UpdateProductDto) {
		const { product_photo, quantity } = updateProductDto;
		console.log("🚀 ~ ProductAdminService ~ update ~ product_photo:", product_photo);

		if (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 0)) {
			throw new BadRequestException("Số lượng sản phẩm không được âm");
		}

		const foundProduct = await this.productRepository.findOne({
			where: { id: productId },
			include: [{ model: ProductPhotoModel }],
		});

		if (!foundProduct) {
			throw new NotFoundException("Không tồn tại sản phẩm!");
		}

		await this.productRepository.sequelize.transaction(async transaction => {
			const updatePayload = { ...updateProductDto };
			const isWarehouseManaged = await this.hasWarehouseInventory(productId, transaction);

			if (isWarehouseManaged) {
				delete updatePayload.quantity;
			}

			await this.productRepository.update(
				{
					...updatePayload,
				},
				{
					where: { id: productId },
					transaction,
				},
			);

			if (product_photo && product_photo.length > 0) {
				const payloadProductPhoto = product_photo.map(item => {
					return {
						url: item.url,
						product_id: productId,
					};
				});

				await this.productPhotoModel.destroy({
					where: { product_id: productId },
					transaction,
				});
				await this.productPhotoModel.bulkCreate(payloadProductPhoto, { transaction });
			}

			if (isWarehouseManaged) {
				await this.syncProductQuantityFromWarehouses(productId, transaction);
			}
		});
	}

	async remove(productId: number) {
		const foundProduct = await this.productRepository.findOne({
			where: { id: productId },
			include: [{ model: ProductPhotoModel }],
		});

		if (!foundProduct) {
			throw new NotFoundException("Không tồn tại sản phẩm!");
		}

		await this.productRepository.destroy({ where: { id: productId } });
	}

	async import(productId: number, dto: ImportProductDto) {
		if (!Number.isInteger(dto.quantity) || dto.quantity <= 0) {
			throw new BadRequestException("Số lượng nhập sản phẩm phải là số nguyên dương");
		}

		await this.productRepository.sequelize.transaction(async transaction => {
			const foundProduct = await this.productRepository.findOne({
				where: { id: productId },
				transaction,
				lock: transaction.LOCK.UPDATE,
			});

			if (!foundProduct) {
				throw new NotFoundException("Không tồn tại sản phẩm!");
			}

			if (await this.hasWarehouseInventory(productId, transaction)) {
				throw new BadRequestException(
					"Sản phẩm này đang quản lý tồn theo nhà kho. Vui lòng nhập qua chức năng Nhập hàng.",
				);
			}

			await foundProduct.increment("quantity", { by: dto.quantity, transaction });
		});
	}

	async exportExcelProducts(dto: SearchProductDto) {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Báo cáo danh sách sản phẩm");

		worksheet.columns = [
			{ header: "STT", key: "index", width: 10 },
			{ header: "Tên sản phẩm", key: "name", width: 30 },
			{ header: "Giá tiền", key: "price", width: 30 },
			{ header: "Trạng thái", key: "status", width: 30 },
			{ header: "Danh mục", key: "category", width: 30 },
			{ header: "Số lượng còn", key: "quantity", width: 30 },
		];

		worksheet.getRow(1).font = {
			bold: true,
		};

		let hasNextData = true;
		let index = 1;
		do {
			const pagedProducts = await this.findAll(dto);
			pagedProducts.data.forEach(product => {
				const row = {
					index: index++,
					name: product.name,
					price: product.price,
					status: convertStatus(product.status),
					category: product.category.name,
					quantity: product.quantity,
				};

				worksheet.addRow(row);
			});
			hasNextData = pagedProducts.data?.length > 0;
			dto.page += 1;
		} while (hasNextData);

		const currentDate = format(new Date(), "dd-MM-yyyy_HH-mm-ss");
		const fileName = `DanhSachSanPham_${currentDate}.xlsx`;
		const filePath = `uploads/excels/${fileName}`;
		const fileUrl = `${process.env.API_BASE_URL}/${filePath}`;

		await workbook.xlsx.writeFile(filePath);

		return fileUrl;
	}
}
