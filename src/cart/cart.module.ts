import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, CartItem, Customers, OrderDetails, Orders, SellerProduct } from 'src/typeorm';
import { CartProfile } from 'src/mapping/cart.mapping';
import { AuthModule } from 'src/auth/auth.module';
import { PriceCalculationModule } from 'src/price-calculation/price-calculation.module';
import { OrderService } from 'src/order/order.service';
import { SellerProductProfile } from 'src/mapping/seller.product.mapping';


@Module({
  imports: [
      TypeOrmModule.forFeature([Cart, Customers, Orders,OrderDetails, SellerProduct, CartItem]),AuthModule,PriceCalculationModule
  ],
  providers: [CartService, CartProfile,OrderService,SellerProductProfile], 
  controllers: [CartController] 
})
export class CartModule {}