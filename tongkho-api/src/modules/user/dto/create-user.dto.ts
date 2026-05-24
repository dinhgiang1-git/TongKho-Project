import { EmailFieldOptional, StringField, StringFieldOptional } from "src/common/decorators/field.decorator";

export class CreateUserDto {
	@StringField()
	name: string;

	@StringFieldOptional()
	username?: string;

	@StringFieldOptional()
	phone?: string;

	@EmailFieldOptional()
	email?: string;

	@StringFieldOptional()
	password?: string;
}
