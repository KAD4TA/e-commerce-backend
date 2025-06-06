import { createParamDecorator, ExecutionContext, NotFoundException, UnauthorizedException } from "@nestjs/common";


export const GetCustomerUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number=> { 
    const request = ctx.switchToHttp().getRequest();
    
    console.log("🟢 GETCUSTOMERUSER:", request.user);

    if (!request.user || request.user.role !== 'CUSTOMER') {
      
      throw new NotFoundException("Customer information not found");
    }

    if (!request.user.customerId) {
      
      throw new UnauthorizedException("Unauthorized: Missing customerId");
    }

    
    return request.user.customerId;
  }
);
