import { BaseResponse } from 'src/base/base.response';

export class ProductReviewResponseDto {
  customerName: string;
  
  productName: string;
  productRate: number;
  reviewImage: string;
  sellerName:string;
  productReview: string;
}

export class ProductReviewResponseDtoWrapper extends BaseResponse<ProductReviewResponseDto[]> {
  constructor(data: ProductReviewResponseDto[], message: string, success: boolean) {
    super(data, message, success);
  }
}