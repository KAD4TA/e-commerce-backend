import { Module, OnModuleInit } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Categories } from 'src/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Categories])],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule implements OnModuleInit {
  constructor(private readonly categoryService: CategoryService) {}

  async onModuleInit() {
    await this.categoryService.seedCategories(); 
  }
}
