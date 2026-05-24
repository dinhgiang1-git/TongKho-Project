import { Module } from "@nestjs/common";
import { CustomerInfoService } from "./customer-info.service";
import { CustomerInfoController } from "./customer-info.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { CustomerInfoModel } from "./model/customer-info.model";

@Module({
	imports: [SequelizeModule.forFeature([CustomerInfoModel])],
	controllers: [CustomerInfoController],
	providers: [CustomerInfoService],
})
export class CustomerInfoModule {}
