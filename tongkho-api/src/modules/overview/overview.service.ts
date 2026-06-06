import { Injectable } from "@nestjs/common";
import { CreateOverviewDto } from "./dto/create-overview.dto";
import { UpdateOverviewDto } from "./dto/update-overview.dto";
import { InjectModel } from "@nestjs/sequelize";
import { OrderModel } from "../order/model/order.model";
import { Sequelize } from "sequelize-typescript";
import { Op } from "sequelize";
import { GetRevenueByMonthDto } from "./dto/get-revenue-by-month.dto";
import { OrderType } from "../order/types/order.type";
import { UserModel } from "../user/model/user.model";
import { ProductModel } from "../product/model/product.model";
import { CategoryModel } from "../category/model/category.model";
import { UserRoles } from "../user/types/user.type";
import { OrderDetailModel } from "../order-detail/model/order-detail.model";
import { GetTopProductDto } from "./dto/get-top-product.dto";
import { QueryTypes } from "sequelize";
import { GetSalesReportDto } from "./dto/get-sales-report.dto";

@Injectable()
export class OverviewService {
	constructor(
		@InjectModel(OrderModel) private readonly orderRepository: typeof OrderModel,
		@InjectModel(UserModel) private readonly userRepository: typeof UserModel,
		@InjectModel(ProductModel) private readonly productRepository: typeof ProductModel,
		@InjectModel(CategoryModel) private readonly categoryRepository: typeof CategoryModel,
		@InjectModel(OrderDetailModel) private readonly orderDetailRepository: typeof OrderDetailModel,
		private readonly sequelize: Sequelize,
	) {}
	create(createOverviewDto: CreateOverviewDto) {
		return "This action adds a new overview";
	}

	async findAll() {
		const countOrders = await this.orderRepository.count();
		const countUsers = await this.userRepository.count({
			where: { role: UserRoles.CUSTOMER },
		});
		const countProducts = await this.productRepository.count();
		const countCategories = await this.categoryRepository.count();

		return {
			countOrders,
			countUsers,
			countProducts,
			countCategories,
		};
	}

	findOne(id: number) {
		return `This action returns a #${id} overview`;
	}

	update(id: number, updateOverviewDto: UpdateOverviewDto) {
		return `This action updates a #${id} overview`;
	}

	remove(id: number) {
		return `This action removes a #${id} overview`;
	}

	async getRevenueByYear(year: string) {
		const revenues = await this.orderRepository.findAll({
			attributes: [
				[Sequelize.fn("MONTH", Sequelize.col("created_at")), "month"],
				[Sequelize.fn("SUM", Sequelize.col("total_price")), "revenue"],
			],
			where: {
				created_at: {
					[Op.between]: [`${year}-01-01`, `${year}-12-31`],
				},
				order_status: OrderType.PAID,
			},
			group: ["month"],
			order: [["month", "ASC"]],
		});

		const monthNames = [
			"Tháng 1",
			"Tháng 2",
			"Tháng 3",
			"Tháng 4",
			"Tháng 5",
			"Tháng 6",
			"Tháng 7",
			"Tháng 8",
			"Tháng 9",
			"Tháng 10",
			"Tháng 11",
			"Tháng 12",
		];

		const monthlyRevenue = monthNames.map((month, index) => ({
			month,
			revenue: 0,
		}));

		revenues.forEach(revenue => {
			const monthIndex = (revenue.get("month") as number) - 1;
			const revenueAmount = parseFloat(revenue.get("revenue") as string);
			monthlyRevenue[monthIndex].revenue = revenueAmount;
		});

		return { monthlyRevenue };
	}

	async getDailyRevenueByMonth(dto: GetRevenueByMonthDto) {
		const { year, month } = dto;

		console.log(year, month);

		const revenues = await this.orderRepository.findAll({
			attributes: [
				[Sequelize.fn("DAY", Sequelize.col("created_at")), "day"],
				[Sequelize.fn("SUM", Sequelize.col("total_price")), "revenue"],
			],
			where: {
				created_at: {
					[Op.between]: [`${year}-${month}-01`, `${year}-${month}-31`],
				},
				order_status: OrderType.PAID,
			},
			group: ["day"],
			order: [["day", "ASC"]],
		});

		const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
		const dailyRevenue = Array(daysInMonth).fill(0);

		revenues.forEach(revenue => {
			const day = revenue.get("day") as number;
			const revenueAmount = revenue.get("revenue") as string;
			dailyRevenue[day - 1] = this.formatPrice(revenueAmount);
		});

		return { year, month, dailyRevenue };
	}

	formatPrice(num: string | any, type?: "VND" | "$") {
		const tmpType = type || "";
		if (num === null || num === undefined || num === "0" || Number.isNaN(parseFloat(num))) return "";
		const result = num.toString().replace(/,/g, "");
		return `${
			result
				.toString()
				.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
				.replace(
					/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|' '|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
					"",
				) + tmpType
		}`;
	}

	async getTopProducts(dto: GetTopProductDto) {
		const currentDate = new Date();
		const { year = currentDate.getFullYear(), month = currentDate.getMonth() + 1, limit = 10 } = dto;
		const replacements: any = { limit, month, year };

		const query = 'SELECT p.id, p.name, p.product_code, p.price, p.image, ' +
			'SUM(od.product_number) AS total_quantity, ' +
			'SUM(od.price * od.product_number) AS total_revenue ' +
			'FROM order_detail od ' +
			'JOIN `order` o ON od.order_id = o.id ' +
			'JOIN product p ON od.product_id = p.id ' +
			'WHERE o.order_status = \'4\' ' +
			'AND MONTH(o.created_at) = :month ' +
			'AND YEAR(o.created_at) = :year ' +
			'GROUP BY p.id, p.name, p.product_code, p.price, p.image ' +
			'ORDER BY total_revenue DESC ' +
			'LIMIT :limit';

		const topProducts = await this.sequelize.query(query, {
			replacements,
			type: QueryTypes.SELECT,
		});

		return topProducts;
	}

	async getSalesReport(dto: GetSalesReportDto) {
		const { fromDate, toDate, groupBy, isAll } = this.getReportRange(dto);
		const dateCondition = isAll ? "" : "AND o.created_at BETWEEN :fromDate AND :toDate";
		const limitCondition = dto.limit && dto.limit > 0 ? "LIMIT :limit" : "";
		const replacements = {
			fromDate: `${fromDate} 00:00:00`,
			toDate: `${toDate} 23:59:59`,
			limit: dto.limit,
			status: OrderType.PAID,
		};

		const summaryRows = await this.sequelize.query<{
			total_revenue: string;
			order_count: number;
			average_order_value: string;
		}>(`
			SELECT
				COALESCE(SUM(o.total_price), 0) AS total_revenue,
				COUNT(o.id) AS order_count,
				COALESCE(AVG(o.total_price), 0) AS average_order_value
			FROM \`order\` o
			WHERE o.order_status = :status
				${dateCondition}
		`, {
			replacements,
			type: QueryTypes.SELECT,
		});

		const productSummaryRows = await this.sequelize.query<{
			total_quantity: string;
			sold_product_count: number;
		}>(`
			SELECT
				COALESCE(SUM(COALESCE(NULLIF(od.product_number, 0), od.quantity, 0)), 0) AS total_quantity,
				COUNT(DISTINCT od.product_id) AS sold_product_count
			FROM order_detail od
			JOIN \`order\` o ON od.order_id = o.id
			WHERE o.order_status = :status
				${dateCondition}
		`, {
			replacements,
			type: QueryTypes.SELECT,
		});

		const periodFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";
		const revenueRows = await this.sequelize.query<{
			period: string;
			revenue: string;
			order_count: number;
		}>(`
			SELECT
				DATE_FORMAT(o.created_at, '${periodFormat}') AS period,
				COALESCE(SUM(o.total_price), 0) AS revenue,
				COUNT(o.id) AS order_count
			FROM \`order\` o
			WHERE o.order_status = :status
				${dateCondition}
			GROUP BY period
			ORDER BY period ASC
		`, {
			replacements,
			type: QueryTypes.SELECT,
		});

		const topProducts = await this.sequelize.query(`
			SELECT
				p.id,
				p.name,
				p.product_code,
				p.price,
				p.image,
				p.quantity AS current_quantity,
				c.name AS category_name,
				COALESCE(SUM(COALESCE(NULLIF(od.product_number, 0), od.quantity, 0)), 0) AS total_quantity,
				COALESCE(SUM(od.price * COALESCE(NULLIF(od.product_number, 0), od.quantity, 0)), 0) AS total_revenue,
				COUNT(DISTINCT o.id) AS order_count
			FROM order_detail od
			JOIN \`order\` o ON od.order_id = o.id
			JOIN product p ON od.product_id = p.id
			LEFT JOIN category c ON p.category_id = c.id
			WHERE o.order_status = :status
				${dateCondition}
			GROUP BY p.id, p.name, p.product_code, p.price, p.image, p.quantity, c.name
			ORDER BY total_revenue DESC, total_quantity DESC
			${limitCondition}
		`, {
			replacements,
			type: QueryTypes.SELECT,
		});

		const summary = summaryRows[0] || {
			total_revenue: "0",
			order_count: 0,
			average_order_value: "0",
		};
		const productSummary = productSummaryRows[0] || {
			total_quantity: "0",
			sold_product_count: 0,
		};

		return {
			filter: {
				filter_type: isAll ? "all" : "custom",
				from_date: isAll ? "" : fromDate,
				to_date: isAll ? "" : toDate,
				group_by: groupBy,
			},
			summary: {
				total_revenue: Number(summary.total_revenue || 0),
				order_count: Number(summary.order_count || 0),
				average_order_value: Number(summary.average_order_value || 0),
				total_quantity: Number(productSummary.total_quantity || 0),
				sold_product_count: Number(productSummary.sold_product_count || 0),
			},
			revenue_series: isAll
				? this.mapRevenueRows(revenueRows, groupBy)
				: this.fillRevenueSeries(revenueRows, fromDate, toDate, groupBy),
			top_products: topProducts,
		};
	}

	private getReportRange(dto: GetSalesReportDto) {
		if (dto.filter_type === "all") {
			return {
				fromDate: "1000-01-01",
				toDate: "9999-12-31",
				groupBy: "month" as "month" | "day",
				isAll: true,
			};
		}

		const today = new Date();
		const defaultFromDate = new Date(today.getFullYear(), today.getMonth(), 1);
		let fromDate = this.normalizeDateParam(dto.from_date, this.formatDateParam(defaultFromDate));
		let toDate = this.normalizeDateParam(dto.to_date, this.formatDateParam(today));

		if (this.parseDateParam(fromDate) > this.parseDateParam(toDate)) {
			[fromDate, toDate] = [toDate, fromDate];
		}

		const dayDiff = this.getDayDiff(fromDate, toDate);

		return {
			fromDate,
			toDate,
			groupBy: (dayDiff > 62 ? "month" : "day") as "month" | "day",
			isAll: false,
		};
	}

	private normalizeDateParam(value: string | undefined, fallback: string) {
		if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;

		return value;
	}

	private mapRevenueRows(rows: Array<{ period: string; revenue: string; order_count: number }>, groupBy: "day" | "month") {
		return rows.map(row => {
			const [year, month, day] = row.period.split("-");

			return {
				period: row.period,
				label: groupBy === "month" ? `Tháng ${Number(month)}/${year}` : `${day}/${month}`,
				revenue: Number(row.revenue || 0),
				order_count: Number(row.order_count || 0),
			};
		});
	}

	private fillRevenueSeries(
		rows: Array<{ period: string; revenue: string; order_count: number }>,
		fromDate: string,
		toDate: string,
		groupBy: "day" | "month",
	) {
		const revenueMap = rows.reduce((acc, row) => {
			acc[row.period] = {
				revenue: Number(row.revenue || 0),
				order_count: Number(row.order_count || 0),
			};

			return acc;
		}, {} as Record<string, { revenue: number; order_count: number }>);

		if (groupBy === "month") {
			const start = this.parseDateParam(fromDate);
			const end = this.parseDateParam(toDate);
			const result = [];
			const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
			const endCursor = new Date(end.getFullYear(), end.getMonth(), 1);

			while (cursor <= endCursor) {
				const period = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
				const value = revenueMap[period] || { revenue: 0, order_count: 0 };
				result.push({
					period,
					label: `Tháng ${cursor.getMonth() + 1}/${cursor.getFullYear()}`,
					...value,
				});
				cursor.setMonth(cursor.getMonth() + 1);
			}

			return result;
		}

		const result = [];
		const cursor = this.parseDateParam(fromDate);
		const end = this.parseDateParam(toDate);

		while (cursor <= end) {
			const period = this.formatDateParam(cursor);
			const value = revenueMap[period] || { revenue: 0, order_count: 0 };
			result.push({
				period,
				label: `${String(cursor.getDate()).padStart(2, "0")}/${String(cursor.getMonth() + 1).padStart(2, "0")}`,
				...value,
			});
			cursor.setDate(cursor.getDate() + 1);
		}

		return result;
	}

	private getDayDiff(fromDate: string, toDate: string) {
		const from = this.parseDateParam(fromDate).getTime();
		const to = this.parseDateParam(toDate).getTime();

		return Math.max(0, Math.ceil((to - from) / (1000 * 60 * 60 * 24)));
	}

	private parseDateParam(value: string) {
		const [year, month, day] = value.split("-").map(Number);

		return new Date(year, month - 1, day);
	}

	private formatDateParam(date: Date) {
		return [
			date.getFullYear(),
			String(date.getMonth() + 1).padStart(2, "0"),
			String(date.getDate()).padStart(2, "0"),
		].join("-");
	}
}
