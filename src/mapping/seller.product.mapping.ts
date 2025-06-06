import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { SellerProduct } from 'src/typeorm/seller.product.entity';
import { SellerProductDetailedResponseDto } from 'src/common/dtos/responseDtos/seller/seller.product.detailed.response.dto';
import { SellerProductBasicResponseDto } from 'src/common/dtos/responseDtos/seller/seller.product.basic.response.dto';
import { Sellers } from 'src/typeorm/sellers.entity';
import { SellerResponseDto } from 'src/common/dtos/responseDtos/seller/seller.response.dto';
import { ProductResponseDto } from 'src/common/dtos/responseDtos/product/product.response.dto';
import { Categories, Products } from 'src/typeorm';
import { UpdateProductRequestDto } from 'src/common/dtos/requestDtos/product/update.product.request.dto';
import { CategoryResponseDto } from 'src/common/dtos/responseDtos/category/category.response.dto';

@Injectable()
export class SellerProductProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      // SellerProduct -> SellerProductBasicResponseDto
      createMap(
        mapper,
        SellerProduct,
        SellerProductBasicResponseDto,
        forMember(
          (dest) => dest.id,
          mapFrom((src) => src.id),
        ),
        forMember(
          (dest) => dest.seller,
          mapFrom((src) => mapper.map(src.seller, Sellers, SellerResponseDto)),
        ),
        forMember(
          (dest) => dest.product,
          mapFrom((src) =>
            mapper.map(src.product, Products, ProductResponseDto),
          ),
        ),
        forMember(
          (dest) => dest.price,
          mapFrom((src) => src.price),
        ),
        forMember(
          (dest) => dest.productImageUrl,
          mapFrom((src) => src.productImageUrl),
        ),
        forMember(
          (dest) => dest.size,
          mapFrom((src) => src.size),
        ),
        forMember(
          (dest) => dest.discountPrice,
          mapFrom((src) => src.discountPrice),
        ),
        forMember(
          (dest) => dest.stock,
          mapFrom((src) => src.stock),
        ),
        forMember(
          (dest) => dest.avgRating,
          mapFrom((src) => src.avgProductRate),
        ),
      );
      //  UpdateProductRequestDto -> Products mapping 
      createMap(
        mapper,
        UpdateProductRequestDto,
        Products,
        forMember(
          (dest) => dest.name,
          mapFrom((src) => src.productName),
        ),
        forMember(
          (dest) => dest.description,
          mapFrom((src) => src.productDescription),
        ),
        forMember(
          (dest) => dest.basePrice,
          mapFrom((src) => src.productUnitPrice),
        ),
        forMember(
          (dest) => dest.productImageUrl,
          mapFrom((src) => src.productImageUrl),
        ),
      );

      // UpdateProductRequestDto -> SellerProduct mapping 
      createMap(
        mapper,
        UpdateProductRequestDto,
        SellerProduct,
        forMember(
          (dest) => dest.price,
          mapFrom((src) => src.productUnitPrice),
        ),
        forMember(
          (dest) => dest.discountPrice,
          mapFrom((src) => src.productDiscountedPrice),
        ),
        forMember(
          (dest) => dest.size,
          mapFrom((src) => src.size),
        ),
        forMember(
          (dest) => dest.stock,
          mapFrom((src) => src.productStock),
        ),
        forMember(
          (dest) => dest.productImageUrl,
          mapFrom((src) => src.productImageUrl),
        ),
      );

      // SellerProduct -> SellerProductDetailedResponseDto
      createMap(
        mapper,
        SellerProduct,
        SellerProductDetailedResponseDto,
        forMember(
          (dest) => dest.id,
          mapFrom((src) => src.id),
        ),
        forMember(
          (dest) => dest.seller,
          mapFrom((src) => mapper.map(src.seller, Sellers, SellerResponseDto)),
        ),
        forMember(
          (dest) => dest.product,
          mapFrom((src) =>
            mapper.map(src.product, Products, ProductResponseDto),
          ),
        ),
        forMember(
          (dest) => dest.price,
          mapFrom((src) => src.price),
        ),
        forMember(
          (dest) => dest.productImageUrl,
          mapFrom((src) => src.productImageUrl),
        ),
        forMember(
          (dest) => dest.size,
          mapFrom((src) => src.size),
        ),
        forMember(
          (dest) => dest.discountPrice,
          mapFrom((src) => src.discountPrice),
        ),
        forMember(
          (dest) => dest.stock,
          mapFrom((src) => src.stock),
        ),
        forMember(
          (dest) => dest.avgRating,
          mapFrom((src) => src.avgProductRate),
        ),
        forMember(
          (dest) => dest.favoriteCount,
          mapFrom((src) => src.favorites?.length || 0),
        ),
        forMember(
          (dest) => dest.otherSellers,
          mapFrom((src) => []),
        ),
      );
    };
  }
}
