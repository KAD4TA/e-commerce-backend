import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { SellerProductService } from './seller-product.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { SellerGuard } from 'src/guards/role.seller.guard';
import { ProductRequestDto } from 'src/common/dtos/requestDtos/product/product.request.dto';
import { Sellers } from 'src/typeorm';
import { GetSellerUser } from 'src/common/decorators/get.seller.user.decorator';
import { SellerProductBasicListResponseDtoWrapper } from 'src/common/dtos/responseDtos/seller/seller.product.basic.response.dto';
import { SellerProductDetailedListResponseDtoWrapper } from 'src/common/dtos/responseDtos/seller/seller.product.detailed.response.dto';
import { UpdateProductRequestDto } from 'src/common/dtos/requestDtos/product/update.product.request.dto';


@Controller('seller-product')
export class SellerProductController {
  constructor(private readonly sellerProductService: SellerProductService) {}

  @Post('/add-product')
  @UseGuards(JwtAuthGuard, SellerGuard)
  async createProduct(
    @Body() productRequestDto: ProductRequestDto,
    @GetSellerUser() seller: number): Promise<SellerProductBasicListResponseDtoWrapper> {
      return this.sellerProductService.createProduct(productRequestDto, seller);
    }
  
    @Put("/:id")
    @UseGuards(JwtAuthGuard, SellerGuard)
    async updateProduct(
      @Param("id", ParseIntPipe) id: number,
      @Body() productRequestDto: UpdateProductRequestDto,
      @GetSellerUser() seller: number
    ): Promise<SellerProductBasicListResponseDtoWrapper> {
      return this.sellerProductService.updateSellerProduct(id, productRequestDto, seller);
    }
  
    @Delete(":id")
    @UseGuards(JwtAuthGuard, SellerGuard)
    async deleteProduct(
      @Param("id", ParseIntPipe) id: number,
      @GetSellerUser() seller: number
    ): Promise<{ message: string }> {
      return this.sellerProductService.deleteProduct(id, seller);
    }
}
