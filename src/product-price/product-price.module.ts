import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductPriceService } from "./product-price.service";
import { Products, SellerProduct } from "src/typeorm";


@Module({
  imports: [
    TypeOrmModule.forFeature([Products, SellerProduct])
    
  ],
  providers: [ProductPriceService],
  exports: [ProductPriceService],
})
export class ProductPriceModule {}