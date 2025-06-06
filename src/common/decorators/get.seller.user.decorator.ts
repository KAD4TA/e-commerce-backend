import { createParamDecorator, ExecutionContext, NotFoundException, UnauthorizedException } from '@nestjs/common';



export const GetSellerUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    
    

    if (!request.user || request.user.role !== 'SELLER') {
     
      throw new NotFoundException("Not Found to the Seller Information");
    }

    if (!request.user.sellerId) {
      
      throw new UnauthorizedException("Unauthorized user - No sellerId");
    }

    
    return request.user.sellerId; 
  },
);