import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceCalculationService } from './price-calculation.service';
import { SellerProduct } from 'src/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SellerProduct])],
  providers: [PriceCalculationService],
  exports: [PriceCalculationService], 
})
export class PriceCalculationModule {}