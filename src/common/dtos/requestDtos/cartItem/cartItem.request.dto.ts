import { IsInt, Min } from "class-validator";

export class CartItemRequestDto {
    @IsInt()
    @Min(1)
    quantity: number;
  
    @IsInt()
    sellerProductId: number;
  }