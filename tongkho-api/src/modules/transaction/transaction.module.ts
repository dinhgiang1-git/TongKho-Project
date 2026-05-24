import { Module } from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { TransactionController } from "./transaction.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { TransactionModel } from "./model/transaction.model";
import { UserModel } from "../user/model/user.model";
import { WebsocketGateWay } from "../websocket/websocket.gateway";
import { JwtService } from "@nestjs/jwt";

@Module({
	imports: [SequelizeModule.forFeature([TransactionModel, UserModel])],
	controllers: [TransactionController],
	providers: [TransactionService, WebsocketGateWay, JwtService],
})
export class TransactionModule {}
