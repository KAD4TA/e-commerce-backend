

export class OtherSellerProductResponseDto {
  id: number;
  sellerName: string;
  productName: string;
  price: number;
  discountPrice?: number | null;  
  avgRating?: number;
}
