import { EnumField } from "src/common/decorators/field.decorator";
import { WarehouseImportStatus } from "../constants/warehouse-import.constant";

export class UpdateImportStatusDto {
	@EnumField(() => WarehouseImportStatus)
	status: WarehouseImportStatus;
}
