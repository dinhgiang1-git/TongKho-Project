import { SetMetadata } from "@nestjs/common";
import { UserRoles } from "src/modules/user/types/user.type";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);
