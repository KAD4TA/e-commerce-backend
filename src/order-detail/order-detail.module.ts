import { Module } from '@nestjs/common';
import { OrderDetailService } from './order-detail.service';
import { OrderDetailController } from './order-detail.controller';
import { Customers, OrderDetails, Sellers, Users } from 'src/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerGuard } from 'src/guards/role.seller.guard';
import { CustomerGuard } from 'src/guards/role.customer.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[TypeOrmModule.forFeature([OrderDetails,Users,Sellers,Customers]),
AuthModule],
  controllers: [OrderDetailController],
  providers: [OrderDetailService,SellerGuard,CustomerGuard],
})
export class OrderDetailModule {}
