import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    
    const request = context.switchToHttp().getRequest();
   
  
    if (!request.user) {
      
      throw new UnauthorizedException("User authentication failed.");
    }
  
    return result;
  }
}