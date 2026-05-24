import { Get, Post, Body, Param, Delete, UseGuards, Request, Put } from "@nestjs/common";
import { CustomerInfoService } from "./customer-info.service";
import { CreateCustomerInfoDto } from "./dto/create-customer-info.dto";
import { GenericController } from "src/common/decorators/controller.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRoles } from "../user/types/user.type";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UpdateCustomerInfoDto } from "./dto/update-customer-info.dto";

@GenericController("customer-info")
export class CustomerInfoController {
	constructor(private readonly customerInfoService: CustomerInfoService) {}

	@Post()
	@Roles(UserRoles.CUSTOMER)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async create(@Body() createCustomerInfoDto: CreateCustomerInfoDto, @Request() req) {
		const customerId = req?.user?.id;
		return await this.customerInfoService.create(createCustomerInfoDto, customerId);
	}

	@Get()
	@Roles(UserRoles.CUSTOMER)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async findAll(@Request() req) {
		const customerId = req?.user?.id;
		const customerInfo = await this.customerInfoService.findAll(customerId);
		return customerInfo;
	}

	@Get(":id")
	@Roles(UserRoles.CUSTOMER)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async findOne(@Param("id") id: string) {
		return this.customerInfoService.findOne(+id);
	}

	@Delete(":id")
	@Roles(UserRoles.CUSTOMER)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async remove(@Param("id") id: string) {
		return await this.customerInfoService.remove(+id);
	}

	@Put(":id")
	@Roles(UserRoles.CUSTOMER)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async update(@Param("id") id: number, @Body() dto: UpdateCustomerInfoDto, @Request() req) {
		const customerId = req?.user?.id;

		console.log(customerId);

		return await this.customerInfoService.update(+id, dto, customerId);
	}
}
