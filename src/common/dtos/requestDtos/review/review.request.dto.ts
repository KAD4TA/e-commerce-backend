// src/common/dtos/requestDtos/review/review.request.dto.ts
import { AutoMap } from "@automapper/classes";
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class ReviewRequestDto {
  @AutoMap()
  @IsInt()
  @IsNotEmpty()
  sellerProductId: number;

  @AutoMap()
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  productRate: number;

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  productReview: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  reviewImage?: string;

  @AutoMap()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  sellerRate?: number;

  @AutoMap()
  @IsOptional()
  @IsString()
  sellerReview?: string;
}