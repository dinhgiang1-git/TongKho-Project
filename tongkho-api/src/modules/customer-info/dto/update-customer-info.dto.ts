import { PartialType } from "@nestjs/swagger";
import { CreateCustomerInfoDto } from "./create-customer-info.dto";
import { BooleanFieldOptional, StringFieldOptional } from "src/common/decorators/field.decorator";

export class UpdateCustomerInfoDto {
	@StringFieldOptional()
	name?: string;

	@StringFieldOptional()
	phone?: string;

	@StringFieldOptional()
	address?: string;

	@BooleanFieldOptional()
	is_default?: boolean;
}
