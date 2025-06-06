import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { OrderDetailService } from "./order-detail.service";
import { OrderDetailResponseDto } from "src/common/dtos/responseDtos/orderDetail/order.detail.response.dto";

import { GetCustomerUser } from "src/common/decorators/get.customer.user.decorator";
import { GetSellerUser } from "src/common/decorators/get.seller.user.decorator";

import { JwtAuthGuard } from "src/guards/jwt.auth.guard";
import { CustomerGuard } from "src/guards/role.customer.guard";
import { SellerGuard } from "src/guards/role.seller.guard";

@Controller("order-details")
export class OrderDetailController {
  constructor(private readonly orderDetailService: OrderDetailService) {}

  @Get("customer/:orderId")
  @UseGuards(JwtAuthGuard,CustomerGuard)
  async getOrderDetailsForCustomer(
    @GetCustomerUser() customer: number,
    @Param("orderId") orderId: number
  ): Promise<OrderDetailResponseDto[]> {
    return this.orderDetailService.getOrderDetailsForCustomer(customer, orderId);
  }

  @Get("seller/:orderId")
  @UseGuards(JwtAuthGuard,SellerGuard)
  async getOrderDetailsForSeller(
    @GetSellerUser() seller:number,
    @Param("orderId") orderId: number
    
  ): Promise<OrderDetailResponseDto[]> {
    return this.orderDetailService.getOrderDetailsForSeller(seller, orderId);
  }
}