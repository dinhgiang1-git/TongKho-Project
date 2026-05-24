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
import { UserModel } from "src/modules/user/model/user.model";

@Table({
	tableName: "manager",
})
export class AdminModel extends Model {
	@Column({
		type: DataType.INTEGER,
		primaryKey: true,
	})
	@ForeignKey(() => UserModel)
	id: string;

	@BelongsTo(() => UserModel)
	user: UserModel;

	@CreatedAt
	created_at: Date;

	@UpdatedAt
	updated_at: Date;

	@DeletedAt
	deleted_at: Date;
}
