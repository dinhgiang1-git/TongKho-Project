import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super();
	}

	validate(username: string, password: string) {
		console.log("Inside Local Strategy");

		const user = this.authService.validateAdmin(username, password);

		if (!user) {
			throw new UnauthorizedException("Không có quyền truy cập");
		}

		return user;
	}
}
