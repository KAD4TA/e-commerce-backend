import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { SellerModule } from './seller/seller.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { FavoriteModule } from './favorite/favorite.module';
import { ReviewModule } from './review/review.module';
import { CartModule } from './cart/cart.module';
import { OrderDetailModule } from './order-detail/order-detail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { DatabaseConfig } from './common/config/database.config';
import { SellerProductModule } from './seller-product/seller-product.module';
import { ProductPriceModule } from './product-price/product-price.module';

import 'dotenv/config';
import { PriceCalculationModule } from './price-calculation/price-calculation.module';
import { LevelCodesModule } from './level-codes/level-codes.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [DatabaseConfig],
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database')
      }),
      inject: [ConfigService],
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(), 
    }),
    AuthModule,
    FavoriteModule,
    ReviewModule,
    CartModule,
    ProductModule,
    UserModule,
    OrderModule,
    CustomerModule,
    OrderDetailModule,
    SellerModule,
    CategoryModule,
    ProductPriceModule,
    SellerProductModule,
    PriceCalculationModule,
    LevelCodesModule,
   
  ],
  controllers: [AppController],
  providers: [AppService ],
})


export class AppModule {}
