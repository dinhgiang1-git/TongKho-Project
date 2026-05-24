import { BooleanFieldOptional, StringFieldOptional } from "src/common/decorators/field.decorator";

export class CreateCustomerInfoDto {
	@StringFieldOptional()
	name?: string;

	@StringFieldOptional()
	phone?: string;

	@StringFieldOptional()
	address?: string;

	@BooleanFieldOptional()
	is_default?: boolean;
}
