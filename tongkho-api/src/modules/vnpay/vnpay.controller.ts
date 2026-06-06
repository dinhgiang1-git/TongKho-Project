import { Controller, Get, Query, Req } from "@nestjs/common";
import { VnpayService } from "./vnpay.service";

@Controller("vnpay")
export class VnpayController {
	constructor(private readonly vnpayService: VnpayService) {}

	@Get("return")
	async vnpayReturn(@Query() query: Record<string, string>) {
		// Trong môi trường dev (localhost), VNPay không thể gọi đến webhook IPN.
		// Nên ta chủ động gọi hàm xử lý IPN ngay khi user được redirect về để cập nhật DB.
		// Hàm handleIpn đã có sẵn logic kiểm tra chữ ký và tránh cập nhật trùng lặp.
		await this.vnpayService.handleIpn(query).catch(err => console.error("Local IPN sync error", err));

		const result = this.vnpayService.verifyReturnUrl(query);
		return result;
	}

	@Get("ipn")
	async vnpayIpn(@Query() query: Record<string, string>) {
		const result = await this.vnpayService.handleIpn(query);
		return result;
	}
}
