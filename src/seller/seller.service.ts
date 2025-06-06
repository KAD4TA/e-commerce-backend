import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import * as bcrypt from 'bcrypt';

import { Sellers, Users } from 'src/typeorm';
import { UpdateSellerRequestDto } from 'src/common/dtos/requestDtos/seller/update.seller.request.dto';
import { SellerResponseDto, SellerResponseDtoWrapper } from 'src/common/dtos/responseDtos/seller/seller.response.dto';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(Sellers)
    private readonly sellerRepository: Repository<Sellers>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async updateSellerProfile(userId: number, dto: UpdateSellerRequestDto): Promise<SellerResponseDtoWrapper> {
    
    try {
      const seller = await this.sellerRepository.findOne({
        where:  { id: userId } ,
        relations: ['user'],
      });

      if (!seller) {
        throw new NotFoundException('Seller not found');
      }

     
      if (dto.storeName) seller.storeName = dto.storeName;
      if (dto.taxNumber) seller.taxNumber = dto.taxNumber;
      if (dto.storeAddress) seller.storeAddress = dto.storeAddress;

     
      if (dto.email) seller.user.email = dto.email;
      if (dto.telephoneNumber) seller.user.telephoneNumber = dto.telephoneNumber;
      if (dto.userImage) seller.user.userImage = dto.userImage;
      if (dto.name) seller.user.name = dto.name; 
      if (dto.lastname) seller.user.lastName = dto.lastname; 

      
      if (dto.password) {
        const salt = await bcrypt.genSalt(10);
        seller.user.password = await bcrypt.hash(dto.password, salt);
      }

      
      await this.userRepository.save(seller.user);
      const updatedSeller = await this.sellerRepository.save(seller);

     
      const responseDto = this.mapper.map(updatedSeller, Sellers, SellerResponseDto);

      return {
        success: true,
        message: 'Seller profile updated successfully',
        data: responseDto,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('An error occurred while updating the seller profile');
    }
  }
}
