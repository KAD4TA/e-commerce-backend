import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CustomerResponseDto } from 'src/common/dtos/responseDtos/customer/customer.response.dto';
import { Customers } from 'src/typeorm';

@Injectable()
export class CustomersProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {

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
          mapFrom((src) => src.user),
        ), 
      );
    };
  }
}
