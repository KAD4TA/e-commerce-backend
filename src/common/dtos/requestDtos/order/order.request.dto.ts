import { AutoMap } from "@automapper/classes";
import { IsInt } from "class-validator";



export class OrderRequestDto{
    @IsInt()
    cartId: number;
}