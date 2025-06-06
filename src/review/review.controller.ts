import { Controller, Post, Body, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { CustomerGuard } from 'src/guards/role.customer.guard';
import { GetCustomerUser } from 'src/common/decorators/get.customer.user.decorator';
import { ReviewService } from './review.service';
import { ReviewRequestDto } from 'src/common/dtos/requestDtos/review/review.request.dto';
import { ReviewResponseDtoWrapper } from 'src/common/dtos/responseDtos/review/review.response.dto';
import { ProductReviewResponseDtoWrapper } from 'src/common/dtos/responseDtos/review/product.review.dto';
import { SellerReviewResponseDtoWrapper } from 'src/common/dtos/responseDtos/review/seller.review.dto';
import { SellerGuard } from 'src/guards/role.seller.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard, CustomerGuard)
  @Post('/create-review')
  async createReview(
    @GetCustomerUser() customer: number,
    @Body() reviewData: ReviewRequestDto,
  ): Promise<ReviewResponseDtoWrapper> {
    return this.reviewService.createReview(customer, reviewData);
  }
  @UseGuards(JwtAuthGuard, SellerGuard)
  @Get('seller/:sellerId')     //seller's products
  async getSellerProducts(
    @Param('sellerId', ParseIntPipe) sellerId: number,
  ): Promise<SellerReviewResponseDtoWrapper> {
    return this.reviewService.getSellerReviews(sellerId);
  }

  @Get('product/:productId')   //sellers of the product
  async getProductSellers(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ProductReviewResponseDtoWrapper> {
    return this.reviewService.getProductReviews(productId);
  }
}
