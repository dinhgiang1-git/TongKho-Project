import { Body, Delete, Get, HttpStatus, Post, Put, Query, Request, Res } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Response } from "express";
import moment from "moment";
import { format } from "path";

import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { GenericController } from "src/common/decorators/controller.decorator";
import { TransactionModel } from "./model/transaction.model";
import { UserModel } from "../user/model/user.model";
import { WebsocketGateWay } from "../websocket/websocket.gateway";

@GenericController("transaction")
export class TransactionController {
	constructor(
		@InjectModel(TransactionModel) private readonly transactionRepository: typeof TransactionModel,
		@InjectModel(UserModel) private readonly userRepository: typeof UserModel,
		private readonly websocketGateway: WebsocketGateWay,
	) {}

	@Post()
	async createTransaction(@Body() dto: CreateTransactionDto, @Request() req: any, @Res() res: Response) {
		try {
			// Kiểm tra dữ liệu từ SePay
			if (!dto || typeof dto !== "object") {
				return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid data" });
			}

			console.log("stack 1");

			// Khởi tạo các biến
			const {
				gateway,
				transactionDate,
				accountNumber,
				subAccount,
				transferType,
				transferAmount,
				accumulated,
				code,
				content: transactionContent,
				referenceCode: referenceNumber,
				description: body,
			} = dto;

			console.log("stack 2");

			let amountIn = 0;
			let amountOut = 0;

			console.log("stack 3");

			// Kiểm tra giao dịch tiền vào hay tiền ra
			if (transferType === "in") {
				amountIn = transferAmount;
			} else if (transferType === "out") {
				amountOut = transferAmount;
			}
			console.log("stack 4");

			// const currentDateTime = moment().toISOString();

			console.log("stack 5");

			// // Lưu giao dịch vào database
			// const transaction = await this.transactionRepository.create({
			// 	gateway: gateway,
			// 	account_number: accountNumber,
			// 	sub_account: subAccount,
			// 	amount_in: amountIn,
			// 	amount_out: amountOut,
			// 	accumulated: accumulated,
			// 	code: code,
			// 	transaction_content: transactionContent,
			// 	reference_number: referenceNumber,
			// 	body: body,
			// });

			console.log("stack 6");

			const match = transactionContent.match(/MKH(\d+)/);

			console.log("stack 7");

			if (match) {
				const userId = match[1]; // Lấy mã user
				const foundUser = await this.userRepository.findOne({ where: { id: userId } });
				console.log("stack 8");

				if (foundUser) {
					console.log("stack 9");

					console.log(userId);

					// Gửi socket thông báo về client cho user vừa giao dịch
					this.websocketGateway.sendNotification(userId, {
						code: 1,
						message: "Giao dịch thành công!",
					});
				}
			} else {
				console.log("Không tìm thấy số sau MKH");
			}

			return res.status(HttpStatus.OK).json({ success: true });
		} catch (error) {
			console.error(error);
			return res
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.json({ success: false, message: "Error processing webhook" });
		}
	}
}
