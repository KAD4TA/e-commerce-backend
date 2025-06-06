import { createParamDecorator, ExecutionContext, NotFoundException, UnauthorizedException } from "@nestjs/common";

export const GetAdminUser = createParamDecorator(
  (data: { requireSuperAdmin?: boolean }, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();

   
    if (!request.user || request.user.role !== 'ADMIN') {
      throw new NotFoundException("Admin information not found");
    }

    // Check super admin
    if (data?.requireSuperAdmin && request.user.adminLevel !== 2) {
      throw new UnauthorizedException("Unauthorized: Super admin access required");
    }

    if (!request.user.adminId) {
      throw new UnauthorizedException("Unauthorized: Missing admin user ID");
    }

    return request.user.adminId;
  }
);
