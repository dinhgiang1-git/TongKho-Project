import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { CategoryModel } from "./model/category.model";
import { CategoryAdminController } from "./admin/category-admin.controller";
import { CategoryAdminService } from "./admin/category-admin.service";

@Module({
	imports: [SequelizeModule.forFeature([CategoryModel])],
	controllers: [CategoryController, CategoryAdminController],
	providers: [CategoryService, CategoryAdminService],
})
export class CategoryModule {}
