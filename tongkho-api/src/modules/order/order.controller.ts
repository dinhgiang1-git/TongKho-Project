import { Get, Post, Body, Patch, Param, UseGuards, Request, Query, Header, Res } from "@nestjs/common";
import { Response } from "express";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { GenericController } from "src/common/decorators/controller.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRoles } from "../user/types/user.type";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { SearchOrderDto } from "./dto/search-order.dto";
import { CancelOrderDto } from "./dto/cancel-order.dto";
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt.guard";
import { VnpayService } from "../vnpay/vnpay.service";

@GenericController("order")
export class OrderController {
	constructor(
		private readonly orderService: OrderService,
		private readonly vnpayService: VnpayService,
	) {}

	@Post()
	@UseGuards(OptionalJwtAuthGuard)
	async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
		const result = await this.orderService.create(createOrderDto, req.user?.id);

		if (createOrderDto.payment_method === "VNPAY") {
			const ipAddr = req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "127.0.0.1";
			const paymentUrl = this.vnpayService.createPaymentUrl(
				result.order.id,
				Number(result.order.total_price),
				`Thanh toan don hang #${result.order.id}`,
				Array.isArray(ipAddr) ? ipAddr[0] : ipAddr,
			);
			return { ...result, payment_url: paymentUrl };
		}

		return result;
	}

	@Get()
	@Header("Cache-Control", "no-store")
	@Roles(UserRoles.CUSTOMER, UserRoles.ADMIN, UserRoles.STAFF)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async findAll(@Query() dto: SearchOrderDto, @Request() req) {
		const orders = await this.orderService.findAll(dto, req);
		return orders;
	}

	@Get(":id/invoice")
	@UseGuards(OptionalJwtAuthGuard)
	async exportInvoice(@Param("id") id: number, @Query("phone") phone: string, @Request() req, @Res() res: Response) {
		const pdfBuffer = await this.orderService.generateInvoicePdf(+id, req.user?.id, phone);
		res.set({
			"Content-Type": "application/pdf",
			"Content-Disposition": `attachment; filename="hoa-don-${id}.pdf"`,
			"Content-Length": pdfBuffer.length,
		});
		res.end(pdfBuffer);
	}

	@Get(":id")
	@Roles(UserRoles.CUSTOMER)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async findOne(@Param("id") id: number, @Request() req) {
		return await this.orderService.findOne(+id, req.user.id);
	}

	@Patch("/cancel/:id")
	@Roles(UserRoles.CUSTOMER, UserRoles.ADMIN, UserRoles.STAFF)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async cancelOrder(@Param("id") id: number, @Body() dto: CancelOrderDto, @Request() req) {
		return this.orderService.cancelOrder(+id, dto, req.user);
	}
}
