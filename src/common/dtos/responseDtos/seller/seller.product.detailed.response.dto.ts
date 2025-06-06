
import { BaseResponse } from "src/base/base.response";
import { ProductResponseDto } from "../product/product.response.dto";
import { SellerResponseDto } from "./seller.response.dto";
import { OtherSellerProductResponseDto } from "./other.seller.product.response.dto";

export class SellerProductDetailedResponseDto {
  id: number;
  seller: SellerResponseDto;
  product: ProductResponseDto;
  price: number;
  productImageUrl?: string;
  size: string;
  discountPrice?: number;
  stock: number;
  avgRating?: number;
  favoriteCount: number;
  otherSellers?: OtherSellerProductResponseDto[];
}

export class MetaData {
  total: number;
  page: number;
  limit: number;
}

export class SellerProductDetailedResponseDtoWrapper extends BaseResponse<SellerProductDetailedResponseDto> {
  constructor(data: SellerProductDetailedResponseDto, message: string, success: boolean) {
    super(data, message, success);
  }
  meta?: MetaData;
}

export class SellerProductDetailedListResponseDtoWrapper extends BaseResponse<SellerProductDetailedResponseDto[]> {
  constructor(data: SellerProductDetailedResponseDto[], message: string, success: boolean) {
    super(data, message, success);
  }
}