import {
	EnumField,
	EnumFieldOptional,
	NumberField,
	NumberFieldOptional,
	StringField,
	StringFieldOptional,
} from "src/common/decorators/field.decorator";
import { ProductTypes } from "../types/product.type";
import { ProductStatus } from "../constants/product.constant";
import { IsArray, IsOptional } from "class-validator";
import { CreateProductPhotoDto } from "src/modules/product-photo/dto/create-product-photo.dto";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {
	@StringField()
	name: string;

	@NumberField()
	category_id: number;

	@NumberField()
	price: number;

	@EnumField(() => ProductTypes)
	product_type: ProductTypes;

	@EnumFieldOptional(() => ProductStatus)
	status?: ProductStatus;

	@NumberFieldOptional({ int: true, minimum: 0 })
	quantity?: number;

	@IsArray()
	@IsOptional()
	@ApiProperty()
	product_photo: CreateProductPhotoDto[];

	@StringFieldOptional()
	description?: string;

	@StringField()
	image: string;

	@StringFieldOptional()
	introduce: string;

	@NumberFieldOptional()
	supplier_id?: number;
}
