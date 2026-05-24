import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { ProductPhotoService } from "./product-photo.service";
import { CreateProductPhotoDto } from "./dto/create-product-photo.dto";
import { UpdateProductPhotoDto } from "./dto/update-product-photo.dto";
import { GenericController } from "src/common/decorators/controller.decorator";

@GenericController("product-photo")
export class ProductPhotoController {
	constructor(private readonly productPhotoService: ProductPhotoService) {}

	@Post()
	create(@Body() createProductPhotoDto: CreateProductPhotoDto) {
		return this.productPhotoService.create(createProductPhotoDto);
	}

	@Get()
	findAll() {
		return this.productPhotoService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.productPhotoService.findOne(+id);
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() updateProductPhotoDto: UpdateProductPhotoDto) {
		return this.productPhotoService.update(+id, updateProductPhotoDto);
	}

	@Delete(":id")
	async remove(@Param("id") id: number) {
		return await this.productPhotoService.remove(+id);
	}
}
