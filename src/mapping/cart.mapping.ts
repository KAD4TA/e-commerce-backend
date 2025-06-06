import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CartRequestDto } from 'src/common/dtos/requestDtos/cart/cart.request.dto';
import { CartItemRequestDto } from 'src/common/dtos/requestDtos/cartItem/cartItem.request.dto';
import { CartResponseDto } from 'src/common/dtos/responseDtos/cart/cart.response.dto';
import { CartItemResponseDto } from 'src/common/dtos/responseDtos/cartItem/cartItem.response.dto';
import { Cart, CartItem, SellerProduct } from 'src/typeorm';


@Injectable()
export class CartProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        CartRequestDto,
        Cart,
        forMember(
          (dest) => dest.cartItems,
          mapFrom((src) =>
            mapper.mapArray(src.cartItems, CartItemRequestDto, CartItem),
          ),
        ),
      );

      createMap(
        mapper,
        CartItemRequestDto,
        CartItem,
        forMember(
          (dest) => dest.quantity,
          mapFrom((src) => src.quantity),
        ),
        forMember(
          (dest) => dest.sellerProduct,
          mapFrom((src) => ({ id: src.sellerProductId }) as SellerProduct),
        ),
      );

      createMap(
        mapper,
        Cart,
        CartResponseDto,
        forMember(
          (dest) => dest.cartId,
          mapFrom((src) => src.id),
        ),
        forMember(
          (dest) => dest.customerName,
          mapFrom((src) => src.customer?.user?.name ?? 'Bilinmiyor'),
        ),
        forMember(
          (dest) => dest.customerLastName,
          mapFrom((src) => src.customer?.user?.lastName ?? 'Bilinmiyor'),
        ),
        forMember(
          (dest) => dest.customerAddress,
          mapFrom((src) => src.customer?.address ?? 'Bilinmiyor'),
        ),
        forMember(
          (dest) => dest.customerCity,
          mapFrom((src) => src.customer?.city ?? 'Bilinmiyor'),
        ),
        forMember(
          (dest) => dest.customerEmail,
          mapFrom((src) => src.customer?.user?.email ?? 'Bilinmiyor'),
        ),
        forMember(
          (dest) => dest.customerTelephoneNumber,
          mapFrom((src) => src.customer?.user?.telephoneNumber ?? 'Bilinmiyor')
        ),
        forMember(
          (dest) => dest.cartItems,
          mapFrom((src) =>
            src.cartItems
              ? mapper.mapArray(src.cartItems, CartItem, CartItemResponseDto)
              : [],
          ),
        ),
        forMember(
          (dest) => dest.totalPrice,
          mapFrom((src) => src.totalPrice),
        ),
        forMember(
          (dest) => dest.shipPrice,
          mapFrom((src) => src.shipPrice),
        ),
        forMember(
          (dest) => dest.isActive,
          mapFrom((src) => src.isActive),
        ),
      );

      createMap(
        mapper,
        CartItem,
        CartItemResponseDto,
        forMember(
          (dest) => dest.id,
          mapFrom((src) => src.id),
        ),
        forMember(
          (dest) => dest.quantity,
          mapFrom((src) => src.quantity),
        ),
        forMember(
          (dest) => dest.sellerProductId,
          mapFrom((src) => src.sellerProduct?.id),
        ),
        forMember(
          (dest) => dest.sellerProductName,
          mapFrom(
            (src) => src.sellerProduct?.product?.name ?? 'Unknown Product',
          ),
        ),
        forMember(
          (dest) => dest.sellerProductImageUrl,
          mapFrom((src) => src.sellerProduct?.productImageUrl ?? ''),
        ),
        forMember(
          (dest) => dest.size,
          mapFrom((src) => src.sellerProduct?.size ?? 'Standart'),
        ),
        forMember(
          (dest) => dest.discountPrice,
          mapFrom((src) => src.sellerProduct?.discountPrice),
        ),
        forMember(
          (dest) => dest.price,
          mapFrom((src) => src.sellerProduct?.price),
        ),
        forMember(
          (dest) => dest.storeName,
          mapFrom(
            (src) => src.sellerProduct?.seller?.storeName ?? 'Unknown Seller',
          ),
        ),
      );
    };
  }
}
