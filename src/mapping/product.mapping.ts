import { createMap, forMember, mapFrom, Mapper } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Injectable } from "@nestjs/common";
import { ProductRequestDto } from "src/common/dtos/requestDtos/product/product.request.dto";
import { ProductResponseDto } from "src/common/dtos/responseDtos/product/product.response.dto";
import { Categories, Products, SellerProduct } from "src/typeorm";
import { CategoryResponseDto } from "src/common/dtos/responseDtos/category/category.response.dto";


@Injectable()
export class ProductProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      // ProductRequestDto -> Products
      createMap(
        mapper,
        ProductRequestDto,
        Products,
        forMember(
          (dest) => dest.name,
          mapFrom((src) => src.productName)
        ),
        forMember(
          (dest) => dest.description,
          mapFrom((src) => src.productDescription)
        ),
        forMember(
          (dest) => dest.basePrice,
          mapFrom((src) => src.productUnitPrice)
        ),
        forMember(
          (dest) => dest.category,
          mapFrom((src) => ({ id: src.productCategoryId } as Categories))
        ),
        forMember(
          (dest) => dest.productImageUrl,
          mapFrom((src) => src.productImageUrl)
        )
      );

      // ProductRequestDto -> SellerProduct
      createMap(
        mapper,
        ProductRequestDto,
        SellerProduct,
        
        forMember((dest) => dest.price, mapFrom((src) => src.productUnitPrice)),
        forMember((dest) => dest.discountPrice, mapFrom((src) => src.productDiscountedPrice)),
        forMember((dest) => dest.stock, mapFrom((src) => src.productStock)),
        forMember((dest) => dest.productImageUrl, mapFrom((src) => src.productImageUrl)),
        forMember((dest) => dest.size, mapFrom((src) => src.size)),
       
      );

      // Products -> ProductResponseDto
      createMap(
        mapper,
        Products,
        ProductResponseDto,
        forMember(
          (dest) => dest.id,
          mapFrom((src) => src.id)
        ),
        forMember(
          (dest) => dest.name,
          mapFrom((src) => src.name)
        ),
        forMember(
          (dest) => dest.description,
          mapFrom((src) => src.description)
        ),
        forMember(
          (dest) => dest.basePrice,
          mapFrom((src) => src.basePrice)
        ),
        forMember(
          (dest) => dest.category,
          mapFrom((src) => mapper.map(src.category, Categories, CategoryResponseDto))
        ),
        forMember(
          (dest) => dest.productImageUrl,
          mapFrom((src) => src.productImageUrl)
        ),
        forMember(
          (dest) => dest.avgRating,
          mapFrom((src) =>
            src.sellerProducts && src.sellerProducts.length > 0
              ? src.sellerProducts.reduce((sum, sp) => sum + sp.avgProductRate, 0) / src.sellerProducts.length
              : undefined
          )
        )
      );

     
    };
  }
}