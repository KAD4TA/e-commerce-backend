import { Body, Controller,  Put, UseGuards } from '@nestjs/common';
import { SellerService } from './seller.service';
import { GetSellerUser } from 'src/common/decorators/get.seller.user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { SellerGuard } from 'src/guards/role.seller.guard';
import { UpdateSellerRequestDto } from 'src/common/dtos/requestDtos/seller/update.seller.request.dto';


@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Put('/update-profile')
  @UseGuards(JwtAuthGuard,SellerGuard)
  async updateProfile(@GetSellerUser() userId:number, @Body() dto: UpdateSellerRequestDto) {
    return this.sellerService.updateSellerProfile(userId, dto);
  }
}