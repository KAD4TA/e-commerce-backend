import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResponseDto, UserResponseDtoWrapper } from 'src/common/dtos/responseDtos/user/user.response.dto';
import { Users } from 'src/typeorm';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async findAll(): Promise<UserResponseDtoWrapper> {
    const users = await this.userRepository.find();
    const userDtos = await this.mapper.mapArrayAsync(users, Users, UserResponseDto);
    return new UserResponseDtoWrapper(userDtos, 'Users retrieved successfully', true);
  }

  async findOne(id: number): Promise<UserResponseDtoWrapper> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    const userDto = await this.mapper.mapAsync(user, Users, UserResponseDto);
    return new UserResponseDtoWrapper([userDto], 'User retrieved successfully', true);
  }

  async delete(id: number, requestUserId: number, requestUserRole: string): Promise<void> {
    if (requestUserRole !== 'ADMIN' && id !== requestUserId) {
      throw new ForbiddenException('Unsuccessful deleted process');
    }

    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
  }
}