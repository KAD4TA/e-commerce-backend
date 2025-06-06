import { BaseResponse } from "src/base/base.response";

import { SellerResponseDto } from "../seller/seller.response.dto";

import { SellerProductBasicResponseDto } from "../seller/seller.product.basic.response.dto";

export class OrderDetailResponseDto {
  id: number;
  sellerProduct: SellerProductBasicResponseDto;
  seller: SellerResponseDto;
  quantity: number;
  orderNumber:string;
  unitPrice: number;
  totalPrice: number;
}

export class OrderDetailResponseDtoWrapper extends BaseResponse<OrderDetailResponseDto> {
  constructor(data: OrderDetailResponseDto, message: string, success: boolean) {
    super(data, message, success);
  }
}