import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorites, Products, SellerProduct, Users } from 'src/typeorm';
import { SellerGuard } from 'src/guards/role.seller.guard';
import { CustomerGuard } from 'src/guards/role.customer.guard';
import { FavoriteProfile } from 'src/mapping/favorite.mapping';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Favorites, Users, Products, SellerProduct]),
    AuthModule, 
  ],
  controllers: [FavoriteController],
  providers: [
    FavoriteService,
    SellerGuard,
    CustomerGuard,
    FavoriteProfile,
    
  ],
})
export class FavoriteModule {}