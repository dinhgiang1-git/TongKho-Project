import { IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { NumberField, NumberFieldOptional, StringField, StringFieldOptional } from "src/common/decorators/field.decorator";

export class OrderItemDto {
	@NumberField()
	product_id: number;

	@NumberField({ int: true, isPositive: true })
	product_number: number;

	@NumberFieldOptional({ int: true, isPositive: true })
	cart_id?: number;
}

export class CreateOrderDto {
	@StringField()
	name: string;

	@StringField()
	phone: string;

	@StringField()
	address: string;

	@StringField()
	city: string;

	@StringField()
	district: string;

	@StringField()
	ward: string;

	@StringFieldOptional()
	payment_method?: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OrderItemDto)
	items: OrderItemDto[];
}
