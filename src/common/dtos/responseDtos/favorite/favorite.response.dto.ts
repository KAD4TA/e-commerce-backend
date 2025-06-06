import { BaseResponse } from "src/base/base.response";

export class FavoriteResponseDto {
  id: number;
  productId: number;
  productImage: string;
  productName: string;
  productDiscount: number;
  productPrice: number;
  productRate: number;
  sellerId: number;
  favoriteCount?: number;
}

export class FavoriteResponseDtoWrapper extends BaseResponse<FavoriteResponseDto | FavoriteResponseDto[] | null> {
  constructor(
    data: FavoriteResponseDto | FavoriteResponseDto[] | null,
    message: string,
    success: boolean,
  ) {
    super(data, message, success);
  }
}