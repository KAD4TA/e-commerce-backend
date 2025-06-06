
import { BaseResponse } from "src/base/base.response";
import { ProductResponseDto } from "../product/product.response.dto";
import { SellerResponseDto } from "./seller.response.dto";

export class SellerProductBasicResponseDto {
  id: number;
  seller: SellerResponseDto;
  product: ProductResponseDto;
  price: number;
  productImageUrl?: string;
  size: string;
  discountPrice?: number;
  stock: number;
  avgRating?: number;
  
}

export class SellerProductBasicResponseDtoWrapper extends BaseResponse<SellerProductBasicResponseDto> {
  constructor(data: SellerProductBasicResponseDto, message: string, success: boolean) {
    super(data, message, success);
  }
 
}

export class SellerProductBasicListResponseDtoWrapper extends BaseResponse<SellerProductBasicResponseDto[]> {
  constructor(data: SellerProductBasicResponseDto[], message: string, success: boolean) {
    super(data, message, success);
  }
}