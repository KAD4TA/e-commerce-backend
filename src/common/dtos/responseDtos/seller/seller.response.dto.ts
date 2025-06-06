import { BaseResponse } from "src/base/base.response";

export class SellerResponseDto{
    sellerId:number;
    
    storeName: string;

    sellerImage:string;

    sellerAverageRate:number;
    
    storeAddress: string;
    
    taxNumber: string;
    
}
export class SellerResponseDtoWrapper extends BaseResponse<SellerResponseDto>{
    constructor(data: SellerResponseDto, message: string, success: boolean) {
            super(data, message, success);
        }
}