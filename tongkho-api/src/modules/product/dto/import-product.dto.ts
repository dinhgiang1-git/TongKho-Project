import { NumberField, StringFieldOptional } from "src/common/decorators/field.decorator";
export class ImportProductDto {
	@NumberField({ int: true, isPositive: true })
	quantity: number;

	@StringFieldOptional()
	note?: string;
}
