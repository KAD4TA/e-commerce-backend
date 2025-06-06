import { BaseResponse } from "src/base/base.response";

export class ReviewResponseDto {
  
  id: number;

  
  customerId: number;

  
  sellerProductId: number;

  
  sellerId: number;

  
  productId: number;

  
  productName: string;

  
  productRate: number;

  
  productReview: string;

  
  reviewImage?: string;

  
  sellerRate?: number;

  
  sellerReview?: string;

  
  createdAt: Date;
}

export class ReviewResponseDtoWrapper extends BaseResponse<ReviewResponseDto> {
  constructor(data: ReviewResponseDto, message: string, success: boolean) {
    super(data, message, success);
  }
}
