import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Reviews } from 'src/typeorm';
import { SellerReviewResponseDto } from 'src/common/dtos/responseDtos/review/seller.review.dto';
import { ProductReviewResponseDto } from 'src/common/dtos/responseDtos/review/product.review.dto';
import { ReviewResponseDto } from 'src/common/dtos/responseDtos/review/review.response.dto';

@Injectable()
export class ReviewProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        Reviews,
        ReviewResponseDto,
        forMember(dest => dest.id, mapFrom(src => src.id || 0)), // id alanını ekle
        forMember(dest => dest.customerId, mapFrom(src => src.customer?.id || 0)),
        forMember(dest => dest.sellerProductId, mapFrom(src => src.sellerProduct?.id || 0)),
        forMember(dest => dest.sellerId, mapFrom(src => src.seller?.id || 0)),
        forMember(dest => dest.productId, mapFrom(src => src.sellerProduct?.product?.id || 0)),
        forMember(dest => dest.productName, mapFrom(src => src.sellerProduct?.product?.name || 'Bilinmeyen Ürün')),
        forMember(dest => dest.productRate, mapFrom(src => src.productRating || 0)),
        forMember(dest => dest.productReview, mapFrom(src => src.productReviewText || '')),
        forMember(dest => dest.reviewImage, mapFrom(src => src.productReviewImage || '')),
        forMember(dest => dest.sellerRate, mapFrom(src => src.sellerRating || 0)),
        forMember(dest => dest.sellerReview, mapFrom(src => src.sellerReviewText || '')),
        forMember(dest => dest.createdAt, mapFrom(src => src.createdAt || new Date())),
      );

      createMap(
        mapper,
        Reviews,
        SellerReviewResponseDto,
        forMember(dest => dest.sellerId, mapFrom(src => src.seller?.id || 0)),
        forMember(dest => dest.sellerName, mapFrom(src => src.seller?.storeName || 'Bilinmeyen Satıcı')),
        forMember(dest => dest.sellerRate, mapFrom(src => src.sellerRating || 0)),
        forMember(dest => dest.sellerReview, mapFrom(src => src.sellerReviewText || '')),
      );

      createMap(
        mapper,
        Reviews,
        ProductReviewResponseDto,
        forMember(dest => dest.customerName, mapFrom(src => src.customer?.user?.name || 'Bilinmeyen Kullanıcı')),
        forMember(dest => dest.productName, mapFrom(src => src.sellerProduct?.product?.name || 'Bilinmeyen Ürün')),
        forMember(dest => dest.productRate, mapFrom(src => src.productRating || 0)),
        forMember(dest => dest.reviewImage, mapFrom(src => src.productReviewImage || '')),
        forMember(dest => dest.sellerName, mapFrom(src => src.sellerProduct?.seller?.storeName || 'Bilinmeyen Satıcı')),
        forMember(dest => dest.productReview, mapFrom(src => src.productReviewText || '')),
      );
    };
  }
}