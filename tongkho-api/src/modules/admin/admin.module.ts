import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { AdminModel } from "./model/admin.model";
import { SequelizeModule } from "@nestjs/sequelize";
import { UserModel } from "../user/model/user.model";

@Module({
	imports: [SequelizeModule.forFeature([AdminModel, UserModel])],
	controllers: [AdminController],
	providers: [AdminService],
})
export class AdminModule {}
