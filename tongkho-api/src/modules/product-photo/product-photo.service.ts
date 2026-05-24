import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductPhotoDto } from "./dto/create-product-photo.dto";
import { UpdateProductPhotoDto } from "./dto/update-product-photo.dto";
import { InjectModel } from "@nestjs/sequelize";
import { ProductPhotoModel } from "./model/product-photo.model";

@Injectable()
export class ProductPhotoService {
	constructor(@InjectModel(ProductPhotoModel) private readonly productPhotoRepo: typeof ProductPhotoModel) {}

	create(createProductPhotoDto: CreateProductPhotoDto) {
		return "This action adds a new productPhoto";
	}

	findAll() {
		return `This action returns all productPhoto`;
	}

	findOne(id: number) {
		return `This action returns a #${id} productPhoto`;
	}

	update(id: number, updateProductPhotoDto: UpdateProductPhotoDto) {
		return `This action updates a #${id} productPhoto`;
	}

	async remove(id: number) {
		const foundProductPhoto = await this.productPhotoRepo.findOne({
			where: { id: id },
		});

		if (!foundProductPhoto) {
			throw new NotFoundException("Không tìm thấy ảnh!");
		}

		foundProductPhoto.destroy();
	}
}
