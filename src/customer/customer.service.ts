import { Injectable, NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateCustomerRequestDto } from 'src/common/dtos/requestDtos/customer/update.customer.request.dto';
import { CustomerResponseDto, CustomerResponseDtoWrapper } from 'src/common/dtos/responseDtos/customer/customer.response.dto';
import { Customers } from 'src/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customers)
    private readonly customerRepository: Repository<Customers>,
  ) {}

  async updateCustomerProfile(user: number, dto: UpdateCustomerRequestDto): Promise<CustomerResponseDtoWrapper> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { id: user },
        relations: ['user'],
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      
      customer.address = dto.address ?? customer.address;
      customer.city = dto.city ?? customer.city;

      
      if (customer.user) {
        customer.user.name = dto.name ?? customer.user.name;
        customer.user.lastName = dto.lastname ?? customer.user.lastName;
        customer.user.email = dto.email ?? customer.user.email;
        customer.user.telephoneNumber = dto.telephoneNumber ?? customer.user.telephoneNumber;
        customer.user.userImage = dto.userImage ?? customer.user.userImage;

        if (dto.password) {
          const salt = await bcrypt.genSalt(10);
          customer.user.password = await bcrypt.hash(dto.password, salt);
        }
      }

      const updated = await this.customerRepository.save(customer);

      const response: CustomerResponseDto = {
        customerId: updated.id,
        address: updated.address,
        city: updated.city,
        user: {
          id: updated.user.id,
          name: updated.user.name,
          lastName: updated.user.lastName,
          email: updated.user.email,
          telephoneNumber: updated.user.telephoneNumber,
          userImage: updated.user.userImage,
        },
      };

      return new CustomerResponseDtoWrapper(response, 'Profile updated successfully', true);

    } catch (error) {
   
      if (error instanceof HttpException) {
        throw error;
      }
  
      throw new InternalServerErrorException('An error occurred while updating customer profile');
    }
  }
}
