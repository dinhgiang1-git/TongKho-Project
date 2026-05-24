import { Module } from "@nestjs/common";
import { OrderDetailService } from "./order-detail.service";
import { OrderDetailController } from "./order-detail.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { OrderDetailModel } from "./model/order-detail.model";

@Module({
	imports: [SequelizeModule.forFeature([OrderDetailModel])],
	controllers: [OrderDetailController],
	providers: [OrderDetailService],
})
export class OrderDetailModule {}
