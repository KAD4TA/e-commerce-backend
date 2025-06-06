import { BaseResponse } from 'src/base/base.response';

export class SellerReviewResponseDto {
  sellerId: number;
  sellerName: string;
  sellerRate: number;
  sellerReview: string;
}

export class SellerReviewResponseDtoWrapper extends BaseResponse<SellerReviewResponseDto[]> {
  constructor(data: SellerReviewResponseDto[], message: string, success: boolean) {
    super(data, message, success);
  }
}