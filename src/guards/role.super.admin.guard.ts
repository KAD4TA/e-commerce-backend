import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    
    const user = request.user;

    if (user.role === "ADMIN" && user.levelCode?.level === 2) {
      return true;
    }

    throw new ForbiddenException("Access denied - Only super admins allowed");
  }
}
