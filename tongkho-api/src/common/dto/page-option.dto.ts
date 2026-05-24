import { EnumFieldOptional, NumberFieldOptional, StringFieldOptional } from "../decorators/field.decorator";

export enum Order {
	ASC,
	DESC,
}
export class PageOptionsDto {
	@EnumFieldOptional(() => Order, {
		default: Order.DESC,
	})
	readonly order: Order = Order.DESC;

	@NumberFieldOptional({
		minimum: 1,
		default: 1,
		int: true,
	})
	page = 1;

	@NumberFieldOptional({
		minimum: 1,
		default: 10,
		int: true,
		example: 10,
	})
	readonly take: number = 10;

	get skip(): number {
		return (this.page - 1) * this.take;
	}

	@StringFieldOptional()
	readonly q?: string;

	static skip(p: PageOptionsDto): number {
		return (p.page - 1) * p.take;
	}
}
