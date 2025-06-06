import { AutoMap } from "@automapper/classes";
import { CartItemRequestDto } from "../cartItem/cartItem.request.dto";
import { IsInt, IsNotEmpty, IsNumber } from "class-validator";

export class CartRequestDto {
  

    @AutoMap()
    cartItems: CartItemRequestDto[]; 

    @AutoMap()
    @IsNumber()
    shipPrice: number;

    @AutoMap()
    @IsNumber()
    totalPrice: number;
}
