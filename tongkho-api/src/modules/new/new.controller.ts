import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from "@nestjs/common";
import { NewService } from "./new.service";
import { CreateNewDto } from "./dto/create-new.dto";
import { UpdateNewDto } from "./dto/update-new.dto";
import { GenericController } from "src/common/decorators/controller.decorator";

@GenericController("new")
export class NewController {
	constructor(private readonly newService: NewService) {}

	@Post()
	create(@Body() createNewDto: CreateNewDto) {
		return this.newService.create(createNewDto);
	}

	@Get()
	findAll() {
		return this.newService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.newService.findOne(+id);
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() updateNewDto: UpdateNewDto) {
		return this.newService.update(+id, updateNewDto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.newService.remove(+id);
	}
}
