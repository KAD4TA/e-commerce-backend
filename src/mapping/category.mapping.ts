import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Categories } from 'src/typeorm';
import { CategoryResponseDto } from 'src/common/dtos/responseDtos/category/category.response.dto';
import { CategoryEnumMap, SubCategoryEnumMap } from 'src/common/enums/category.enum';

@Injectable()
export class CategoryProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Categories,
        CategoryResponseDto,
        forMember(
          dest => dest.categoryId,
          mapFrom(src => CategoryEnumMap[src.categoryId])
        ),
        forMember(
          dest => dest.subCategoryId,
          mapFrom(src => SubCategoryEnumMap[src.subCategoryId])
        )
      );
    };
  }
}
