import { Module } from "@nestjs/common";
import { ProductPhotoService } from "./product-photo.service";
import { ProductPhotoController } from "./product-photo.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { ProductModel } from "../product/model/product.model";
import { ProductPhotoModel } from "./model/product-photo.model";

@Module({
	imports: [SequelizeModule.forFeature([ProductPhotoModel])],
	controllers: [ProductPhotoController],
	providers: [ProductPhotoService],
})
export class ProductPhotoModule {}
