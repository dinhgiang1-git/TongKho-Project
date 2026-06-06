import * as fs from "fs";
import { ORDER_STATUS } from "src/common/helpers/ultils";

const PDFDocument = require("pdfkit");

const calculateLineTotal = (price: number, quantity: number) => {
	return Math.round(price * quantity);
};

const formatPrice = (value: number | string) => {
	const numberValue = Number(value) || 0;
	return `${numberValue.toLocaleString("vi-VN")} đ`;
};

const formatDate = (value: Date | string) => {
	const date = value ? new Date(value) : new Date();
	return date.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

const getInvoiceFontPath = () => {
	const candidates = [
		process.env.INVOICE_FONT_PATH,
		"C:/Windows/Fonts/arial.ttf",
		"C:/Windows/Fonts/tahoma.ttf",
		"/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
		"/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
	].filter((fontPath): fontPath is string => Boolean(fontPath));

	return candidates.find(fontPath => fs.existsSync(fontPath));
};

const drawRow = (
	doc: any,
	y: number,
	values: Array<{ text: string; x: number; width: number; align?: "left" | "right" | "center" }>,
	height = 28,
) => {
	values.forEach(value => {
		doc.text(value.text, value.x, y + 8, {
			width: value.width,
			align: value.align || "left",
			lineBreak: false,
		});
	});
	doc.moveTo(40, y + height)
		.lineTo(555, y + height)
		.strokeColor("#e5e7eb")
		.stroke();
};

export const buildInvoicePdf = async (order: any): Promise<Buffer> => {
	const doc = new PDFDocument({ size: "A4", margin: 40 });
	const chunks: Buffer[] = [];
	const fontPath = getInvoiceFontPath();

	if (fontPath) {
		doc.font(fontPath);
	}

	doc.on("data", chunk => chunks.push(chunk));

	doc.fillColor("#111827").fontSize(22).text("HÓA ĐƠN BÁN HÀNG", 40, 42, { align: "center" });
	doc.fontSize(10).fillColor("#6b7280").text(`Mã hóa đơn: HD-${order.id}`, 40, 74, { align: "center" });

	doc.fillColor("#111827").fontSize(13).text("TỔNG KHO KIM KHÍ", 40, 112);
	doc.fontSize(10).fillColor("#374151");
	doc.text("Địa chỉ: 299 Trung Kính, Yên Hòa, Cầu Giấy, Hà Nội");
	doc.text("Hotline: 038.4609.456");
	doc.text("Email: thesonshop@gmail.com");

	doc.fontSize(10)
		.fillColor("#374151")
		.text(`Ngày lập: ${formatDate(new Date())}`, 365, 112, { width: 190 });
	doc.text(`Ngày đặt: ${formatDate(order.created_at)}`, 365, 130, { width: 190 });
	doc.text(`Trạng thái: ${ORDER_STATUS[order.order_status]?.text || "Không xác định"}`, 365, 148, { width: 190 });

	doc.moveTo(40, 184).lineTo(555, 184).strokeColor("#d1d5db").stroke();

	doc.fillColor("#111827").fontSize(12).text("Thông tin khách hàng", 40, 204);
	doc.fontSize(10).fillColor("#374151");
	doc.text(`Khách hàng: ${order.name || order.customer?.name || ""}`, 40, 228);
	doc.text(`Số điện thoại: ${order.phone || order.customer?.phone || ""}`, 40, 246);
	doc.text(
		`Địa chỉ: ${[order.address, order.ward, order.district, order.city].filter(Boolean).join(", ")}`,
		40,
		264,
		{
			width: 515,
		},
	);
	if (order.note) {
		doc.text(`Ghi chú: ${order.note}`, 40, 282, { width: 515 });
	}

	const tableTop = order.note ? 322 : 304;
	doc.rect(40, tableTop, 515, 30).fill("#f3f4f6");
	doc.fillColor("#111827").fontSize(10);
	drawRow(
		doc,
		tableTop,
		[
			{ text: "STT", x: 48, width: 35, align: "center" },
			{ text: "Sản phẩm", x: 92, width: 190 },
			{ text: "SL", x: 292, width: 35, align: "center" },
			{ text: "Đơn giá", x: 342, width: 100, align: "right" },
			{ text: "Thành tiền", x: 462, width: 85, align: "right" },
		],
		30,
	);

	let y = tableTop + 30;
	const details = order.order_details || [];
	details.forEach((detail: any, index: number) => {
		const quantity = Number(detail.product_number) || 0;
		const price = Number(detail.price || detail.product?.price) || 0;
		const lineTotal = calculateLineTotal(price, quantity);
		const productName = detail.product?.name || `Sản phẩm #${detail.product_id}`;

		if (y > 710) {
			doc.addPage();
			if (fontPath) {
				doc.font(fontPath);
			}
			y = 50;
		}

		drawRow(
			doc,
			y,
			[
				{ text: String(index + 1), x: 48, width: 35, align: "center" },
				{ text: productName, x: 92, width: 190 },
				{ text: String(quantity), x: 292, width: 35, align: "center" },
				{ text: formatPrice(price), x: 342, width: 100, align: "right" },
				{ text: formatPrice(lineTotal), x: 462, width: 85, align: "right" },
			],
			34,
		);
		y += 34;
	});

	const totalY = Math.max(y + 22, 650);
	doc.moveTo(340, totalY).lineTo(555, totalY).strokeColor("#d1d5db").stroke();
	doc.fontSize(11)
		.fillColor("#111827")
		.text("Tổng thanh toán:", 342, totalY + 18, { width: 110 });
	doc.fontSize(16)
		.fillColor("#c0392b")
		.text(formatPrice(order.total_price), 450, totalY + 14, {
			width: 105,
			align: "right",
		});

	doc.fontSize(9).fillColor("#6b7280").text("Cảm ơn quý khách đã mua hàng tại Tổng Kho Kim Khí.", 40, 760, {
		align: "center",
	});

	doc.end();

	return new Promise(resolve => {
		doc.on("end", () => resolve(Buffer.concat(chunks)));
	});
};
