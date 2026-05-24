import { Module } from "@nestjs/common";
import { NewService } from "./new.service";
import { NewController } from "./new.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { CategoryModel } from "../category/model/category.model";
import { NewModel } from "./model/new.model";

@Module({
	imports: [SequelizeModule.forFeature([NewModel])],
	controllers: [NewController],
	providers: [NewService],
})
export class NewModule {}
