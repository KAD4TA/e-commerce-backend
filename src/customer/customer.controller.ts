import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { CustomersService } from './customer.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { CustomerGuard } from 'src/guards/role.customer.guard';
import { GetCustomerUser } from 'src/common/decorators/get.customer.user.decorator';
import { Customers } from 'src/typeorm';
import { UpdateCustomerRequestDto } from 'src/common/dtos/requestDtos/customer/update.customer.request.dto';


@Controller('customer')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Put('/update-profile')
  @UseGuards(JwtAuthGuard,CustomerGuard) 
  async updateProfile(@GetCustomerUser() user:number, @Body() dto: UpdateCustomerRequestDto) {
    return this.customersService.updateCustomerProfile(user, dto);
  }
}