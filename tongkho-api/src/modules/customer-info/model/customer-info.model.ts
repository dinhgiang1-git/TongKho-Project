export class CustomerInfo {}
export class CustomerWallet {}
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
import { CustomerModel } from "src/modules/customer/model/customer.model";

@Table({
	tableName: "customer_info",
})
export class CustomerInfoModel extends Model {
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	id: number;

	@Column({
		type: DataType.INTEGER,
	})
	@ForeignKey(() => CustomerModel)
	customer_id: number;

	@BelongsTo(() => CustomerModel)
	customer: CustomerModel;

	@Column({
		type: DataType.STRING,
	})
	customer_name: string;

	@Column({
		type: DataType.STRING,
	})
	customer_phone: string;

	@Column({
		type: DataType.STRING,
	})
	customer_address: string;

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: true,
	})
	is_default: boolean;

	@CreatedAt
	created_at: Date;

	@UpdatedAt
	updated_at: Date;

	@DeletedAt
	deleted_at: Date;
}
