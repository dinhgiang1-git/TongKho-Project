import { Column, Table, Model, DataType } from "sequelize-typescript";

@Table({ tableName: "transaction" })
export class TransactionModel extends Model {
	@Column({ type: DataType.STRING })
	gateway: string;

	@Column({ type: DataType.DATE })
	transaction_date: Date;

	@Column({ type: DataType.STRING })
	account_number?: string;

	@Column({ type: DataType.STRING })
	sub_account?: string;

	@Column({ type: DataType.INTEGER, defaultValue: 0 })
	amount_in: number;

	@Column({ type: DataType.INTEGER, defaultValue: 0 })
	amount_out: number;

	@Column({ type: DataType.INTEGER, defaultValue: 0 })
	accumulated: number;

	@Column({ type: DataType.STRING })
	code?: string;

	@Column({ type: DataType.TEXT })
	transaction_content?: string;

	@Column({ type: DataType.STRING })
	reference_number?: string;

	@Column({ type: DataType.TEXT })
	body?: string;
}
