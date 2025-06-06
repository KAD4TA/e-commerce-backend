import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEnum, SubCategoryEnum } from 'src/common/enums/category.enum';
import { Categories } from 'src/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoryRepository: Repository<Categories>
  ) {}

  async seedCategories() {
    const categories = [
      { categoryId: CategoryEnum.ELECTRONICS, subCategoryId: SubCategoryEnum.MOBILE_PHONES },
      { categoryId: CategoryEnum.ELECTRONICS, subCategoryId: SubCategoryEnum.LAPTOPS },
      { categoryId: CategoryEnum.CLOTHING, subCategoryId: SubCategoryEnum.MEN_CLOTHING },
      { categoryId: CategoryEnum.CLOTHING, subCategoryId: SubCategoryEnum.WOMEN_CLOTHING },
      { categoryId: CategoryEnum.HOME_APPLIANCES, subCategoryId: SubCategoryEnum.KITCHEN_APPLIANCES },
      { categoryId: CategoryEnum.HOME_APPLIANCES, subCategoryId: SubCategoryEnum.CLEANING_DEVICES },
    ];

    for (const category of categories) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { categoryId: category.categoryId, subCategoryId: category.subCategoryId },
      });

      if (!existingCategory) {
        await this.categoryRepository.save(category);
      }
    }
    
  }
}
