import { Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Put, Request } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { GenericController } from "src/common/decorators/controller.decorator";
import { FilterCustomerDto } from "./dto/filter-customers.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UserRoles } from "../user/types/user.type";

@GenericController("customer")
export class CustomerController {
	constructor(private readonly customerService: CustomerService) {}

	@Post()
	async registerCustomer(@Body() createCustomerDto: CreateCustomerDto) {
		return await this.customerService.registerCustomer(createCustomerDto);
	}

	@Get()
	async getAllCustomer(@Query() dto: FilterCustomerDto) {
		const customers = this.customerService.getAllCustomer(dto);
		return customers;
	}

	@Put()
	@Roles(UserRoles.CUSTOMER)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async update(@Body() updateCustomerDto: UpdateCustomerDto, @Request() req) {
		console.log("-------------------------------------------------");

		return await this.customerService.update(updateCustomerDto, req);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.customerService.remove(+id);
	}
}
