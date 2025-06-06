import { PartialType } from '@nestjs/mapped-types';
import { SellerRegisterDto } from '../auth/seller.register.request.dto';


export class UpdateSellerRequestDto extends PartialType(SellerRegisterDto) {}
