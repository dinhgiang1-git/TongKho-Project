import { ApiProperty } from "@nestjs/swagger";

import { PageMetaDto } from "./page-meta.dto";
import type { PageDto } from "./page.dto";

/**
 * Dto for the response
 */
export class ResponseDto<T> {
	@ApiProperty()
	data: T;

	code: number;

	@ApiProperty({ example: 1_617_826_799_860 })
	timestamp: number;

	status: boolean;

	constructor(data: T, code: number) {
		this.data = data;
		this.code = code;
		this.timestamp = Date.now();
		this.status = true;
	}
}

export class PagedResponseDto<T> extends ResponseDto<T[]> {
	@ApiProperty()
	readonly meta: PageMetaDto;

	constructor(pageDto: PageDto<T>, code: number) {
		super(pageDto.data, code);
		this.meta = pageDto.meta;
	}
}
