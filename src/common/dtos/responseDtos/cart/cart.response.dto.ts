import { BaseResponse } from "src/base/base.response";
import { CartItemResponseDto } from "../cartItem/cartItem.response.dto";

export class CartResponseDto {
  cartId: number;
  customerName: string;
  customerLastName: string;
  customerAddress: string;
  customerCity: string;
  customerEmail: string;
  customerTelephoneNumber: string;
  cartItems: CartItemResponseDto[];
  subtotal:number;
  totalPrice: number;
  shipPrice: number;
  isActive: boolean;
}



export class CartResponseDtoWrapper extends BaseResponse<CartResponseDto> {
  constructor(data: CartResponseDto, message: string, success: boolean) {
    super(data, message, success);
  }
}