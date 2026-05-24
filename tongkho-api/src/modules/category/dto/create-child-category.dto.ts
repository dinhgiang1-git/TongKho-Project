import { NumberField, StringField } from "src/common/decorators/field.decorator";

export class CreateChildCategoryDto {
	@NumberField()
	parent_id: number;

	@StringField()
	name: string;
}
