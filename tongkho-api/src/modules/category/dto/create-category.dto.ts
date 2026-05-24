import { StringField } from "src/common/decorators/field.decorator";

export class CreateCategoryDto {
	@StringField()
	name: string;
}
