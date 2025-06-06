import { BaseResponse } from "src/base/base.response";
import { CategoryResponseDto } from "../category/category.response.dto";

export class ProductResponseDto {
    id: number;
    name: string;
    category: CategoryResponseDto;
    description: string;
    productImageUrl: string;
    basePrice: number;
    avgRating?: number; 
}

export class MetaData {
    total: number;  
    page: number;   
    limit: number;  
}

export class ProductResponseDtoWrapper extends BaseResponse<ProductResponseDto[]> {
    constructor(data: ProductResponseDto[], message: string, success: boolean) {
        super(data, message, success);
    }
    meta?: MetaData; 
}