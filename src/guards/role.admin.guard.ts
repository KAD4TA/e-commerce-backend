import { CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";

export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        if (request.user.role === "ADMIN") {
            return true;
        }
        throw new ForbiddenException("Access denied");
    }
}