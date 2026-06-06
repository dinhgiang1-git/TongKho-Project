import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import { InjectModel } from "@nestjs/sequelize";
import { OrderModel } from "../order/model/order.model";
import { OrderType, PayTypes } from "../order/types/order.type";

@Injectable()
export class VnpayService {
	private vnpTmnCode: string;
	private vnpHashSecret: string;
	private vnpUrl: string;
	private vnpReturnUrl: string;

	constructor(
		private readonly configService: ConfigService,
		@InjectModel(OrderModel) private readonly orderRepository: typeof OrderModel,
	) {
		this.vnpTmnCode = this.configService.get<string>("VNP_TMN_CODE");
		this.vnpHashSecret = this.configService.get<string>("VNP_HASH_SECRET");
		this.vnpUrl = this.configService.get<string>("VNP_URL");
		this.vnpReturnUrl = this.configService.get<string>("VNP_RETURN_URL");
	}

	createPaymentUrl(orderId: number, amount: number, orderInfo: string, ipAddr: string): string {
		const date = new Date();
		const createDate = this.formatDate(date);
		const txnRef = String(orderId);

		const params: Record<string, string> = {
			vnp_Version: "2.1.0",
			vnp_Command: "pay",
			vnp_TmnCode: this.vnpTmnCode,
			vnp_Locale: "vn",
			vnp_CurrCode: "VND",
			vnp_TxnRef: txnRef,
			vnp_OrderInfo: orderInfo,
			vnp_OrderType: "other",
			vnp_Amount: String(amount * 100),
			vnp_ReturnUrl: this.vnpReturnUrl,
			vnp_IpAddr: ipAddr,
			vnp_CreateDate: createDate,
		};

		const signData = this.buildHashData(params);
		const hmac = crypto.createHmac("sha512", this.vnpHashSecret);
		const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
		
		const queryString = this.buildQuery(params) + "&vnp_SecureHash=" + signed;
		return `${this.vnpUrl}?${queryString}`;
	}

	verifyReturnUrl(query: Record<string, string>): { isValid: boolean; orderId: string; responseCode: string } {
		const secureHash = query["vnp_SecureHash"];
		const params = { ...query };
		delete params["vnp_SecureHash"];
		delete params["vnp_SecureHashType"];

		const signData = this.buildHashData(params);
		const hmac = crypto.createHmac("sha512", this.vnpHashSecret);
		const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

		return {
			isValid: secureHash === signed,
			orderId: params["vnp_TxnRef"],
			responseCode: params["vnp_ResponseCode"],
		};
	}

	async handleIpn(
		query: Record<string, string>,
	): Promise<{ RspCode: string; Message: string }> {
		const secureHash = query["vnp_SecureHash"];
		const params = { ...query };
		delete params["vnp_SecureHash"];
		delete params["vnp_SecureHashType"];

		const signData = this.buildHashData(params);
		const hmac = crypto.createHmac("sha512", this.vnpHashSecret);
		const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

		if (secureHash !== signed) {
			return { RspCode: "97", Message: "Invalid Checksum" };
		}

		const orderId = Number(params["vnp_TxnRef"]);
		const rspCode = params["vnp_ResponseCode"];
		const transactionNo = params["vnp_TransactionNo"];
		const amount = Number(params["vnp_Amount"]) / 100;

		const order = await this.orderRepository.findByPk(orderId);

		if (!order) {
			return { RspCode: "01", Message: "Order not found" };
		}

		if (order.total_price !== amount) {
			return { RspCode: "04", Message: "Invalid Amount" };
		}

		if (order.pay_type === PayTypes.PAID) {
			return { RspCode: "02", Message: "Order already confirmed" };
		}

		if (rspCode === "00") {
			await this.orderRepository.update(
				{
					pay_type: PayTypes.PAID,
					vnp_transaction_no: transactionNo,
				},
				{ where: { id: orderId } },
			);
			return { RspCode: "00", Message: "Confirm Success" };
		} else {
			return { RspCode: "00", Message: "Confirm Success" };
		}
	}

	private encodeURL(str: string): string {
		return encodeURIComponent(str).replace(/%20/g, "+");
	}

	private buildHashData(params: Record<string, string>): string {
		const sortedKeys = Object.keys(params).sort();
		const hashData: string[] = [];
		for (const key of sortedKeys) {
			const value = params[key];
			if (value !== undefined && value !== null && value !== "") {
				hashData.push(`${key}=${this.encodeURL(String(value))}`);
			}
		}
		return hashData.join("&");
	}

	private buildQuery(params: Record<string, string>): string {
		const sortedKeys = Object.keys(params).sort();
		const query: string[] = [];
		for (const key of sortedKeys) {
			const value = params[key];
			if (value !== undefined && value !== null && value !== "") {
				query.push(`${this.encodeURL(key)}=${this.encodeURL(String(value))}`);
			}
		}
		return query.join("&");
	}

	private formatDate(date: Date): string {
		const pad = (n: number) => String(n).padStart(2, "0");
		return (
			date.getFullYear().toString() +
			pad(date.getMonth() + 1) +
			pad(date.getDate()) +
			pad(date.getHours()) +
			pad(date.getMinutes()) +
			pad(date.getSeconds())
		);
	}
}
