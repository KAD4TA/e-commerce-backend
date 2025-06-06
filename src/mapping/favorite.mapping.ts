import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { FavoriteRequestDto } from 'src/common/dtos/requestDtos/favorite/favorite.request.dto';
import { FavoriteResponseDto } from 'src/common/dtos/responseDtos/favorite/favorite.response.dto';
import { Favorites } from 'src/typeorm';

@Injectable()
export class FavoriteProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      // FavoriteRequestDto -> Favorites
      createMap(
        mapper,
        FavoriteRequestDto,
        Favorites,
        forMember(
          (dest) => dest.sellerProduct.id,
          mapFrom((src) => src.sellerProductId),
        ),
      );

      // Favorites -> FavoriteResponseDto
      createMap(
        mapper,
        Favorites,
        FavoriteResponseDto,
        forMember(
          (dest) => dest.id,
          mapFrom((src) => src.id),
        ),
        forMember(
          (dest) => dest.productId,
          mapFrom((src) => src.sellerProduct.product.id),
        ),
        forMember(
          (dest) => dest.productName,
          mapFrom((src) => src.sellerProduct.product.name),
        ),
        forMember(
          (dest) => dest.productImage,
          mapFrom((src) => src.sellerProduct.productImageUrl),
        ),
        forMember(
          (dest) => dest.productDiscount,
          mapFrom((src) => src.sellerProduct.discountPrice),
        ),
        forMember(
          (dest) => dest.productPrice,
          mapFrom((src) => src.sellerProduct.price),
        ),
      );
    };
  }
}