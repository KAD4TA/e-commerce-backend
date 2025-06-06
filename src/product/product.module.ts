import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categories, Products, SellerProduct } from 'src/typeorm';
import { ProductProfile } from 'src/mapping/product.mapping';
import { ProductPriceModule } from 'src/product-price/product-price.module';
import { SellerProductService } from 'src/seller-product/seller-product.service';
import { CategoryProfile } from 'src/mapping/category.mapping';


@Module({
  imports: [
    TypeOrmModule.forFeature([Products, SellerProduct, Categories]),
    ProductPriceModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, SellerProductService,ProductProfile,CategoryProfile], 
})
export class ProductModule {}
