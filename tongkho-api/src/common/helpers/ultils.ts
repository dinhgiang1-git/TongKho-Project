import bcrypt from "bcrypt";

export function getFullUrl(path?: string): string {
	if (!path) {
		return null;
	}

	const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3009/api/v1";
	const normalizedPath = path
		.replace(/^undefined\/+/, "")
		.replace(/^null\/+/, "")
		.replace(/^\/+/, "");

	if (normalizedPath.startsWith("http")) {
		try {
			const url = new URL(normalizedPath);
			const apiUrl = new URL(apiBaseUrl);

			if (url.origin === apiUrl.origin && url.pathname.startsWith("/uploads/")) {
				return `${apiUrl.origin}/api/v1${url.pathname}`;
			}
		} catch {
			return normalizedPath;
		}

		return normalizedPath;
	}

	if (normalizedPath.startsWith("api/v1/")) {
		return `${apiBaseUrl.replace(/\/api\/v1\/?$/, "")}/${normalizedPath}`;
	}

	return `${apiBaseUrl.replace(/\/+$/, "")}/${normalizedPath}`;
}

export function validateHash(password: string | undefined, hash: string | undefined): Promise<boolean> {
	if (!password || !hash) {
		return Promise.resolve(false);
	}

	return bcrypt.compare(password, hash);
}
export const convertStatus = (status: number) => {
	switch (status) {
		case 1:
			return "Đang hoạt động";
		case 2:
			return "Ngừng hoạt động";
	}
};

export const ORDER_TYPE = {
	PENDING: "1",
	PROCESSING: "2",
	WAITING_FOR_PAYMENT: "3",
	PAID: "4",
	CANCELED: "5",
};

export const ORDER_STATUS = {
	[ORDER_TYPE.PENDING]: {
		text: "Chờ xác nhận",
	},
	[ORDER_TYPE.PROCESSING]: {
		text: "Đang chuẩn bị hàng",
	},
	[ORDER_TYPE.WAITING_FOR_PAYMENT]: {
		text: "Đang giao hàng",
	},
	[ORDER_TYPE.PAID]: {
		text: "Hoàn thành",
	},
	[ORDER_TYPE.CANCELED]: {
		text: "Đã hủy",
	},
};

export const vldOrderStatus = (value: string) => {
	console.log("🚀 ~ vldOrderStatus ~ value:", value);
	return `${ORDER_STATUS[value].text}`;
};
