import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { CustomerGuard } from 'src/guards/role.customer.guard';
import { SellerGuard } from 'src/guards/role.seller.guard';
import { GetCustomerUser } from 'src/common/decorators/get.customer.user.decorator';
import { GetSellerUser } from 'src/common/decorators/get.seller.user.decorator';
import { AdminGuard } from 'src/guards/role.admin.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('customer')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  async getCustomerOrders(@GetCustomerUser() customerId: number) {
    return this.orderService.getCustomerOrders(customerId);
  }
  @Get('seller')
  @UseGuards(JwtAuthGuard, SellerGuard)
  async getSellerOrders(@GetSellerUser() seller: number) {
    return this.orderService.getSellerOrders(seller);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }
}
