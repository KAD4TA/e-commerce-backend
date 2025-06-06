import { AutoMap } from "@automapper/classes";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class FavoriteRequestDto {
  @AutoMap()
  @IsInt()
  @IsNotEmpty()
  sellerProductId: number;
}