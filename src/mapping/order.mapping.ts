import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CustomerResponseDto } from 'src/common/dtos/responseDtos/customer/customer.response.dto';
import { OrderResponseDto } from 'src/common/dtos/responseDtos/order/order.response.dto';
import { Customers, Orders, Users } from 'src/typeorm';
import { UserResponseDto } from 'src/common/dtos/responseDtos/user/user.response.dto';

@Injectable()
export class OrderProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      // Customers -> CustomerResponseDto
      createMap(
        mapper,
        Customers,
        CustomerResponseDto,
        forMember(
          (dest) => dest.customerId,
          mapFrom((src) => src.id),
        ),
        forMember(
          (dest) => dest.address,
          mapFrom((src) => src.address),
        ),
        forMember(
          (dest) => dest.city,
          mapFrom((src) => src.city),
        ),
        forMember(
          (dest) => dest.user,
          mapFrom((src) =>
            src.user ? mapper.map(src.user, Users, UserResponseDto) : null,
          ),
        ),
      );

      // Users -> UserResponse
      createMap(
        mapper,
        Users,
        UserResponseDto,
        forMember(
          (dest) => dest.id,
          mapFrom((src) => src.id),
        ),
        forMember(
          (dest) => dest.name,
          mapFrom((src) => src.name),
        ),
        forMember(
          (dest) => dest.lastName,
          mapFrom((src) => src.lastName),
        ),
        forMember(
          (dest) => dest.userImage,
          mapFrom((src) => src.userImage),
        ),
        forMember(
          (dest) => dest.email,
          mapFrom((src) => src.email),
        ),
      );

      // Orders -> OrderResponseDto
      createMap(
        mapper,
        Orders,
        OrderResponseDto,
        forMember(
          (dest) => dest.id,
          mapFrom((src) => src.id),
        ),
        forMember(
          (dest) => dest.orderNumber,
          mapFrom((src) => src.orderNumber),
        ),
        forMember(
          (dest) => dest.customer,
          mapFrom((src) =>
            src.customer
              ? mapper.map(src.customer, Customers, CustomerResponseDto)
              : null,
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
          (dest) => dest.status,
          mapFrom((src) => src.status),
        ),
      );
    };
  }
}
