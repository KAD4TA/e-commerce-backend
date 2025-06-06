import { createMap, forMember, mapFrom, Mapper } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Injectable } from "@nestjs/common";
import { SellerResponseDto } from "src/common/dtos/responseDtos/seller/seller.response.dto";
import { Sellers } from "src/typeorm";


@Injectable()
export class SellerProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
        

        createMap(
            mapper,
            Sellers,
            SellerResponseDto,
            forMember(
                (dest) => dest.sellerAverageRate,
                mapFrom((src) => src.averageRating),
            ),
            forMember(
                (dest) => dest.sellerId,
                mapFrom((src) => src.id),
            ),
            forMember(
                (dest) => dest.sellerImage,
                mapFrom((src) => src.user.userImage),
            ),
            forMember(
                (dest) => dest.storeName,
                mapFrom((src) => src.storeName),
            ),
            forMember(
                (dest) => dest.storeAddress,
                mapFrom((src) => src.storeAddress),
            ),
            forMember(
                (dest) => dest.taxNumber,
                mapFrom((src) => src.taxNumber),
            ),
            
        )
        
    }
    }
}