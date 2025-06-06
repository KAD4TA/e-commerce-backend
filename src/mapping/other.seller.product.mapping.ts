import { createMap, forMember, mapFrom, Mapper } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Injectable } from "@nestjs/common";
import { OtherSellerProductResponseDto } from "src/common/dtos/responseDtos/seller/other.seller.product.response.dto";
import { SellerProduct } from "src/typeorm";


@Injectable()
export class OtherSellerProductProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper: Mapper) => {
           
            createMap(
                mapper,
                SellerProduct,
                OtherSellerProductResponseDto,
                forMember(
                    (dest)=>dest.avgRating,
                    mapFrom((src)=>src.avgProductRate)
                ),
                forMember(
                    (dest)=>dest.discountPrice,
                    mapFrom((src)=>src.discountPrice)
                ),
                forMember(
                    (dest)=>dest.id,
                    mapFrom((src)=>src.id)
                ),
                forMember(
                    (dest)=>dest.price,
                    mapFrom((src)=>src.price)
                ),
                forMember(
                    (dest)=>dest.sellerName,
                    mapFrom((src)=>src.seller.storeName)
                ),
                forMember(
                    (dest)=>dest.productName,
                    mapFrom((src)=>src.product.name)
                ),
            );
        }
    }
}