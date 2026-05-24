import { DateFieldOptional, NumberFieldOptional, StringFieldOptional } from "src/common/decorators/field.decorator";

export class CreateTransactionDto {
	@NumberFieldOptional()
	id?: number; // ID giao dịch trên SePay

	@StringFieldOptional()
	gateway?: string; // Brand name của ngân hàng

	@DateFieldOptional()
	transactionDate?: Date; // Thời gian xảy ra giao dịch phía ngân hàng

	@StringFieldOptional()
	accountNumber?: string; // Số tài khoản ngân hàng

	@StringFieldOptional()
	code?: string; // Mã code thanh toán (sepay tự nhận diện dựa vào cấu hình tại Công ty -> Cấu hình chung)

	@StringFieldOptional()
	content?: string; // Nội dung chuyển khoản

	@StringFieldOptional()
	transferType?: string; // Loại giao dịch. in là tiền vào, out là tiền ra

	@NumberFieldOptional()
	transferAmount?: number; // Số tiền giao dịch

	@NumberFieldOptional()
	accumulated?: number; // Số dư tài khoản (lũy kế)

	@StringFieldOptional()
	subAccount?: string; // Tài khoản ngân hàng phụ (tài khoản định danh),

	@StringFieldOptional()
	referenceCode?: string; // Mã tham chiếu của tin nhắn sms

	@StringFieldOptional()
	description?: string; // Toàn bộ nội dung tin nhắn sms
}
