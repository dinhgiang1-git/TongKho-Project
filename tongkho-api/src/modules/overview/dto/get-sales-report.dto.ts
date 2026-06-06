import { NumberFieldOptional, StringFieldOptional } from "src/common/decorators/field.decorator";

export class GetSalesReportDto {
	@StringFieldOptional()
	filter_type?: string;

	@StringFieldOptional()
	from_date?: string;

	@StringFieldOptional()
	to_date?: string;

	@NumberFieldOptional()
	limit?: number = 10;
}
