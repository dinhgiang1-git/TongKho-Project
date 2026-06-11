import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { DateField, NumberField, StringField } from "src/common/decorators/field.decorator";

class ExportProductItemDto {
	@NumberField()
	product_id: number;

	@StringField()
	product_name: string;

	@NumberField({ int: true, isPositive: true })
	quantity: number;

	@StringField()
	note: string;
}

export class ExportProductDto {
	@StringField()
	staff_name: string;

	@NumberField()
	warehouse_id: number;

	@DateField()
	export_date: Date;

	@NumberField()
	staff_id: number;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ExportProductItemDto)
	products: ExportProductItemDto[];
}
