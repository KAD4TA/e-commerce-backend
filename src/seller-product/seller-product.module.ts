import { Module } from '@nestjs/common';
import { SellerProductService } from './seller-product.service';
import { SellerProductController } from './seller-product.controller';
import { ProductProfile } from 'src/mapping/product.mapping';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categories, Products, SellerProduct, Sellers, Users } from 'src/typeorm';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { SellerGuard } from 'src/guards/role.seller.guard';
import { ProductPriceModule } from 'src/product-price/product-price.module';
import { AuthModule } from 'src/auth/auth.module';
import { SellerProfile } from 'src/mapping/seller.mapping';
import { OtherSellerProductProfile } from 'src/mapping/other.seller.product.mapping';
import { CategoryProfile } from 'src/mapping/category.mapping';

@Module({
  imports: [
    TypeOrmModule.forFeature([SellerProduct, Products,Users,Sellers,Categories]),
    ProductPriceModule,AuthModule 
  ],
  controllers:[SellerProductController],
  providers: [SellerProductService,ProductProfile,SellerGuard,CategoryProfile,SellerProfile,JwtAuthGuard,OtherSellerProductProfile,ProductProfile],
})
export class SellerProductModule {}

