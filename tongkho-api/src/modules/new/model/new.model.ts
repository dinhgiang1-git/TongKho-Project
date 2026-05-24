import {
	BelongsTo,
	Column,
	CreatedAt,
	DataType,
	DeletedAt,
	ForeignKey,
	HasMany,
	Model,
	Table,
	UpdatedAt,
} from "sequelize-typescript";
import { UserModel } from "src/modules/user/model/user.model";

@Table({
	tableName: "new",
})
export class NewModel extends Model {
	@Column({
		autoIncrement: true,
		type: DataType.INTEGER,
		primaryKey: true,
	})
	id: number;

	@Column({ type: DataType.STRING, allowNull: true })
	title: string;

	@Column({ type: DataType.BOOLEAN, defaultValue: true })
	status: boolean;

	@Column({ type: DataType.TEXT, allowNull: true })
	content: string;

	@Column({ type: DataType.STRING, allowNull: true })
	new_photo: string;

	@CreatedAt
	created_at: Date;

	@UpdatedAt
	updated_at: Date;

	@DeletedAt
	deleted_at: Date;
}
