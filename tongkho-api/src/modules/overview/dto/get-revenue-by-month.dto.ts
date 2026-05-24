import { StringFieldOptional } from "src/common/decorators/field.decorator";

export class GetRevenueByMonthDto {
	@StringFieldOptional()
	year?: string;

	@StringFieldOptional()
	month?: string;
}
