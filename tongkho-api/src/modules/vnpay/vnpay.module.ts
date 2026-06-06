import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { VnpayService } from "./vnpay.service";
import { VnpayController } from "./vnpay.controller";
import { OrderModel } from "../order/model/order.model";

@Module({
	imports: [ConfigModule, SequelizeModule.forFeature([OrderModel])],
	controllers: [VnpayController],
	providers: [VnpayService],
	exports: [VnpayService],
})
export class VnpayModule {}
