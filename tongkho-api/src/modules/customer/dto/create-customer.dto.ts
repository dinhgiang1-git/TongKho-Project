import {
	DateFieldOptional,
	EmailField,
	EmailFieldOptional,
	StringField,
	StringFieldOptional,
} from "src/common/decorators/field.decorator";

export class CreateCustomerDto {
	@StringField()
	name: string;

	@StringFieldOptional()
	username?: string;

	@StringField()
	phone?: string;

	@EmailField()
	email?: string;

	@StringFieldOptional()
	password?: string;

	@StringFieldOptional()
	avatar?: string;

	@DateFieldOptional()
	birth_day?: Date;

	@StringFieldOptional()
	address?: string;
}
