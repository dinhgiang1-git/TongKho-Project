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
import { ProductModel } from "src/modules/product/model/product.model";
import { WarehouseModel } from "./warehouse.model";
import { WarehouseExportStatus } from "../constants/warehouse-export.constant";

@Table({
	tableName: "warehouse_export_history",
})
export class WarehouseExportHistoryModel extends Model {
	@Column({
		type: DataType.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	})
	id: number;

	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	@ForeignKey(() => ProductModel)
	product_id: number;

	@BelongsTo(() => ProductModel)
	product: ProductModel;

	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	@ForeignKey(() => WarehouseModel)
	warehouse_id: number;

	@BelongsTo(() => WarehouseModel)
	warehouse: WarehouseModel;

	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	quantity: number;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	staff_name: string;

	@Column({
		type: DataType.INTEGER,
		allowNull: false,
	})
	staff_id: number;

	@Column({
		type: DataType.DATE,
		allowNull: false,
	})
	export_date: Date;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	note: string;

	@Column({
		type: DataType.ENUM(...Object.values(WarehouseExportStatus)),
		allowNull: false,
		defaultValue: WarehouseExportStatus.COMPLETED,
	})
	status: WarehouseExportStatus;

	@CreatedAt
	created_at: Date;

	@UpdatedAt
	updated_at: Date;

	@DeletedAt
	deleted_at: Date;
}
