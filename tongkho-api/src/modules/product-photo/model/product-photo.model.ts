import {
	BelongsTo,
	Column,
	CreatedAt,
	DataType,
	DeletedAt,
	ForeignKey,
	Model,
	Table,
	UpdatedAt,
} from "sequelize-typescript";
import { getFullUrl } from "src/common/helpers/ultils";
import { ProductModel } from "src/modules/product/model/product.model";

@Table({
	tableName: "product_photo",
})
export class ProductPhotoModel extends Model {
	@Column({
		type: DataType.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	})
	id: string;

	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	@ForeignKey(() => ProductModel)
	product_id: number;

	@BelongsTo(() => ProductModel)
	product: ProductModel;

	@Column({
		type: DataType.STRING,
		allowNull: false,
		get(): string {
			return getFullUrl(this.getDataValue("url"));
		},
	})
	url: string;

	@CreatedAt
	created_at: Date;

	@UpdatedAt
	updated_at: Date;

	@DeletedAt
	deleted_at: Date;
}
