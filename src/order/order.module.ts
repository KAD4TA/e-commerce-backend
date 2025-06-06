import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, CartItem, Customers, OrderDetails, Orders, SellerProduct, Sellers, Users } from 'src/typeorm';
import { SellerGuard } from 'src/guards/role.seller.guard';
import { CustomerGuard } from 'src/guards/role.customer.guard';
import { OrderProfile } from 'src/mapping/order.mapping';
import { AuthModule } from '../auth/auth.module';
import { OrderDetailProfile } from 'src/mapping/order.detail.mapping';
import { PriceCalculationService } from 'src/price-calculation/price-calculation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orders, Cart,CartItem, OrderDetails, Users, Sellers,SellerProduct, Customers]),
    AuthModule, 
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderProfile,
    OrderDetailProfile,
    SellerGuard,
    CustomerGuard,
    PriceCalculationService
  ],
  exports:[OrderService]
})
export class OrderModule {}