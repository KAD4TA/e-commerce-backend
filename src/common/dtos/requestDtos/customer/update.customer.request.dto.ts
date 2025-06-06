import { PartialType } from '@nestjs/mapped-types';
import { CustomerRegisterDto } from "../auth/customer.register.request.dto";

export class UpdateCustomerRequestDto extends PartialType(CustomerRegisterDto) {}
