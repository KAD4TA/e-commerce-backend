import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";



@Injectable()
export class SellerGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        

        if (!request || !request.user) {
            
            throw new ForbiddenException('Bu işlemi yapmak için giriş yapmalısınız.');
        }

        if (request.user.role !== 'SELLER') {
            
            throw new ForbiddenException('Bu işlemi yapmak için satıcı olmalısınız.');
        }

        if (!request.user.sellerId) {
            
            throw new ForbiddenException('Bu işlemi yapmak için satıcı hesabınız olmalıdır.');
        }

        return true;
    }
}