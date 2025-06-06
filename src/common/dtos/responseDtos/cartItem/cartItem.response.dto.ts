

export class CartItemResponseDto {
  id: number;
  sellerProductId: number;
  storeName:string;
  sellerProductName: string;
  sellerProductImageUrl: string;
  size: string;
  quantity: number;
  price: number;
  discountPrice?: number;
}

