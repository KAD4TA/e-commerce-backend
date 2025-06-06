import { CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";



export class CustomerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
 
    
    if (request.user && request.user.role === "CUSTOMER") {
      return true;
    }

    throw new ForbiddenException("Access denied");
  }
}