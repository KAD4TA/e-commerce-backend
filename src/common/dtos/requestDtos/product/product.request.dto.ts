import { AutoMap } from "@automapper/classes";
import { IsInt, IsNotEmpty } from "class-validator";

export class ProductRequestDto{

  
    
    @AutoMap()
    productName: string;
    
    @AutoMap()
    productDescription: string;
    
    @AutoMap()
    productCategoryId: number;

    @AutoMap()
    productSubCategoryId: number;
    
    @AutoMap()
    @IsInt()
    @IsNotEmpty()
    productUnitPrice: number;
    
    @AutoMap()
    @IsInt()
    productDiscountedPrice: number;
    
    @AutoMap()
    size: string;
    
    @AutoMap()
    productStock: number;
    
    @AutoMap()
    productImageUrl: string;
}