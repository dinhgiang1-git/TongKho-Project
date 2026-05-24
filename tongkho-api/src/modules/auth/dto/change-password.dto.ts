import { EmailFieldOptional, StringField, StringFieldOptional } from "src/common/decorators/field.decorator";

export class ChangePassworDto {
	@StringField()
	old_password?: string;

	@StringField()
	new_password?: string;

	@StringField()
	re_enter_password?: string;
}
