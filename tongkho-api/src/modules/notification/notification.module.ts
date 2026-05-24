import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { NotificationModel } from "./model/notification.model";

@Module({
	imports: [SequelizeModule.forFeature([NotificationModel])],
	controllers: [NotificationController],
	providers: [NotificationService],
})
export class NotificationModule {}
