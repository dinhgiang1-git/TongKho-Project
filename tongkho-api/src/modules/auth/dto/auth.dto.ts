import { EmailFieldOptional, StringFieldOptional } from "src/common/decorators/field.decorator";

export class AuthPayloadDto {
	@StringFieldOptional()
	username?: string;

	@StringFieldOptional()
	password?: string;
}
