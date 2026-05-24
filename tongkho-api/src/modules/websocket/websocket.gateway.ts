import { OnModuleInit } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" } })
export class WebsocketGateWay implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
	@WebSocketServer()
	server: Server;

	constructor(private jwtService: JwtService) {}

	async handleConnection(socket: Socket) {
		try {
			console.log(socket.handshake.auth.token);

			console.log("socket connect-----------------------------------");
			const decodedToken: any = await this.jwtService.decode(socket.handshake.auth.token);

			console.log("decodedToken", decodedToken);

			socket.handshake.auth.token = decodedToken;

			if (decodedToken) {
				socket.join(`user_${decodedToken.id}`);
				console.log(`join room user_${decodedToken.id}`);
			}
		} catch (error) {
			socket.handshake.auth.user = null;
		}
	}

	async handleDisconnect(client: any) {
		console.log("socket disconnected");
	}

	onModuleInit() {
		this.server.setMaxListeners(30);
		this.server.on("connection", socket => {
			console.log("Socket Connected");
		});
	}

	sendNotification(user_id: string, data: any): void {
		console.log("Bắn socket");
		console.log(user_id);

		this.server.to(`user_${user_id}`).emit("paysuccess", { data });
	}
}
