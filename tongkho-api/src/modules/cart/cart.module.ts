import { Module } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { CartModel } from "./model/cart.model";
import { ProductModel } from "../product/model/product.model";

@Module({
	imports: [SequelizeModule.forFeature([CartModel, ProductModel])],
	controllers: [CartController],
	providers: [CartService],
})
export class CartModule {}
