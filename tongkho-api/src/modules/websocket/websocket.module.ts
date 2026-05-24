import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { WebsocketGateWay } from "./websocket.gateway";

@Module({
	providers: [WebsocketGateWay, JwtService],
	exports: [WebsocketGateWay],
})
export class WebsocketModule {}
