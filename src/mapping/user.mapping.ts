import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { UserResponseDto } from 'src/common/dtos/responseDtos/user/user.response.dto';
import { Users } from 'src/typeorm';

@Injectable()
export class UserProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
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
          (dest) => dest.email,
          mapFrom((src) => src.email),
        ),
        forMember(
          (dest) => dest.userImage,
          mapFrom((src) => src.userImage),
        ),
        forMember(
          (dest) => dest.telephoneNumber,
          mapFrom((src) => src.telephoneNumber),
        ),
      );
      
    };
  }
}
