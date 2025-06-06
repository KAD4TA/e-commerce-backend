import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Customers, OrderDetails, Orders, Products, Reviews, SellerProduct, Sellers, Users } from 'src/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewProfile } from 'src/mapping/review.mapping';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { JwtStrategy } from 'src/guards/jwt.strategy';
import { CustomerGuard } from 'src/guards/role.customer.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reviews, SellerProduct, Products,Sellers,Orders, Customers,Users])

  ],
  providers: [ReviewService, ReviewProfile,JwtAuthGuard,JwtStrategy,CustomerGuard],
  controllers: [ReviewController],
})
export class ReviewModule {}
