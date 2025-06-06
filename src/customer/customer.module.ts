import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customer.service';
import { Customers, Users } from 'src/typeorm';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { CustomerGuard } from 'src/guards/role.customer.guard';
import { CustomersController } from './customer.controller';
import { CustomersProfile } from 'src/mapping/customer.mapping';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[TypeOrmModule.forFeature([Users,Customers]),AuthModule],
  controllers: [CustomersController],
  providers: [CustomersService,CustomersProfile,CustomerGuard],
})
export class CustomerModule {}
