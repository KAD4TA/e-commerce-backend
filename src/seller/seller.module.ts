import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { SellerGuard } from 'src/guards/role.seller.guard';
import { Sellers, Users } from 'src/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerProfile } from 'src/mapping/seller.mapping';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[TypeOrmModule.forFeature([Sellers,Users]),AuthModule],
  controllers: [SellerController],
  providers: [SellerService,SellerProfile,SellerGuard],
})
export class SellerModule {}
