import { Module } from '@nestjs/common';
import { LevelCodeService } from './level-codes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelCodes } from 'src/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([LevelCodes])],
  providers: [LevelCodeService],
})
export class LevelCodesModule {}
