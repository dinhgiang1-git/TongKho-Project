import { BooleanFieldOptional, DateFieldOptional, StringFieldOptional } from "src/common/decorators/field.decorator";
import { PageOptionsDto } from "src/common/dto/page-option.dto";

export class FilterCustomerDto extends PageOptionsDto {
	@StringFieldOptional()
	status?: string;

	@StringFieldOptional()
	from_date?: string;

	@StringFieldOptional()
	to_date?: string;
}
