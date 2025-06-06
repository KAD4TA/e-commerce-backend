import { createMap, forMember, mapFrom, Mapper } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Injectable } from "@nestjs/common";
import { OrderDetailResponseDto } from "src/common/dtos/responseDtos/orderDetail/order.detail.response.dto";
import { OrderDetails } from "src/typeorm/order.details.entity";
import { SellerProduct } from "src/typeorm/seller.product.entity";
import { SellerProductBasicResponseDto } from "src/common/dtos/responseDtos/seller/seller.product.basic.response.dto";
import { Sellers } from "src/typeorm/sellers.entity";
import { SellerResponseDto } from "src/common/dtos/responseDtos/seller/seller.response.dto";
import { OrderDetailRequestDto } from "src/common/dtos/requestDtos/orderDetail/order.detail.request.dto";
import { Customers, Orders } from "src/typeorm";

@Injectable()
export class OrderDetailProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        OrderDetailRequestDto,
        OrderDetails,
        forMember((dest) => dest.quantity, mapFrom((src) => src.quantity)),
        forMember((dest) => dest.unitPrice, mapFrom((src) => src.unitPrice)),
        forMember((dest) => dest.totalPrice, mapFrom((src) => src.totalPrice)),
        forMember(
          (dest) => dest.sellerProduct,
          mapFrom((src) => ({ id: src.sellerProductId } as SellerProduct))
        ),
        forMember(
          (dest) => dest.order,
          mapFrom((src) => ({ id: src.orderId } as Orders))
        ),
        forMember(
          (dest) => dest.customer,
          mapFrom((src) => ({ id: src.customerId } as Customers))
        )
      );

      createMap(
        mapper,
        OrderDetails,
        OrderDetailResponseDto,
        forMember((dest) => dest.id, mapFrom((src) => src.id)),
        forMember(
          (dest) => dest.sellerProduct,
          mapFrom((src) => mapper.map(src.sellerProduct, SellerProduct, SellerProductBasicResponseDto))
        ),
        forMember(
          (dest) => dest.seller,
          mapFrom((src) => mapper.map(src.order?.seller, Sellers, SellerResponseDto))
        ),
        forMember((dest) => dest.orderNumber,
        mapFrom((src) => (src.order ? src.order.orderNumber : null)) 
        ),
        forMember((dest) => dest.quantity, mapFrom((src) => src.quantity)),
        forMember((dest) => dest.unitPrice, mapFrom((src) => src.unitPrice)),
        forMember((dest) => dest.totalPrice, mapFrom((src) => src.totalPrice))
      );
    };
  }
}