import { PartialType } from "@nestjs/swagger";
import { CreateOrderDto } from "./create-order.dto";
import { EnumFieldOptional } from "src/common/decorators/field.decorator";
import { OrderType, PayTypes } from "../types/order.type";

export class UpdateOrderDto {
	@EnumFieldOptional(() => OrderType)
	order_status?: OrderType;

	@EnumFieldOptional(() => PayTypes)
	pay_type?: PayTypes;
}
