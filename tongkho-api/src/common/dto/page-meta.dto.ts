import { ApiProperty } from "@nestjs/swagger";

import type { PageOptionsDto } from "../dto/page-option.dto";

interface IPageMetaDtoParameters {
	pageOptionsDto: PageOptionsDto;
	itemCount: number;
}

export class PageMetaDto {
	@ApiProperty()
	page: number;

	@ApiProperty()
	take: number;

	@ApiProperty()
	item_count: number;

	@ApiProperty()
	page_count: number;

	@ApiProperty()
	has_previous_page: boolean;

	@ApiProperty()
	has_next_page: boolean;

	constructor({ pageOptionsDto, itemCount }: IPageMetaDtoParameters) {
		this.page = pageOptionsDto.page;
		this.take = pageOptionsDto.take;
		this.item_count = itemCount;
		this.page_count = Math.ceil(this.item_count / this.take);
		this.has_previous_page = this.page > 1;
		this.has_next_page = this.page < this.page_count;
	}
}
