import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Customers, Reviews, SellerProduct, Sellers, Orders, Products } from 'src/typeorm';
import { ReviewRequestDto } from 'src/common/dtos/requestDtos/review/review.request.dto';
import { ReviewResponseDtoWrapper, ReviewResponseDto } from 'src/common/dtos/responseDtos/review/review.response.dto';
import { ProductReviewResponseDtoWrapper, ProductReviewResponseDto } from 'src/common/dtos/responseDtos/review/product.review.dto';
import { SellerReviewResponseDtoWrapper, SellerReviewResponseDto } from 'src/common/dtos/responseDtos/review/seller.review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Reviews)
    private readonly reviewRepository: Repository<Reviews>,
    @InjectRepository(SellerProduct)
    private readonly sellerProductRepository: Repository<SellerProduct>,
    @InjectRepository(Products)
    private readonly productRepository: Repository<Products>,
    @InjectRepository(Customers)
    private readonly customerRepository: Repository<Customers>,
    @InjectRepository(Sellers)
    private readonly sellerRepository: Repository<Sellers>,
    @InjectRepository(Orders)
    private readonly orderRepository: Repository<Orders>,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createReview(customerId: number, reviewData: ReviewRequestDto): Promise<ReviewResponseDtoWrapper> {
    const {
      sellerProductId,
      productRate,
      productReview,
      reviewImage,
      sellerRate,
      sellerReview,
    } = reviewData;

    const sellerProduct = await this.sellerProductRepository.findOne({
      where: { id: sellerProductId },
      relations: ['seller', 'product'],
    });

    if (!sellerProduct) {
      throw new NotFoundException('Seller product not found');
    }

    const hasPurchased = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.orderDetails', 'orderDetails')
      .innerJoin('order.customer', 'customer')
      .where('customer.id = :customerId', { customerId })
      .andWhere('orderDetails.sellerProduct.id = :sellerProductId', { sellerProductId })
      .andWhere('order.status = :status', { status: 'Pending' })  
      .getOne();

    if (!hasPurchased) {
      throw new BadRequestException('You can only review products you have purchased and received');
    }

    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const newReview = this.reviewRepository.create({
      customer,
      sellerProduct,
      seller: sellerProduct.seller,
      productRating: productRate,
      productReviewText: productReview,
      productReviewImage: reviewImage,
      sellerRating: sellerRate,
      sellerReviewText: sellerReview,
    });

    const savedReview = await this.reviewRepository.save(newReview);

    await this.updateProductRatingAverage(sellerProduct);
    if (sellerRate !== null && sellerRate !== undefined) {
      await this.updateSellerRatingAverage(sellerProduct.seller);
    }

    const reviewDto = this.mapper.map(savedReview, Reviews, ReviewResponseDto);

    return {
      success: true,
      message: 'Yorum başarıyla oluşturuldu',
      data: reviewDto,
    };
  }

  private async updateProductRatingAverage(sellerProduct: SellerProduct): Promise<void> {
    const reviews = await this.reviewRepository.find({
      where: { sellerProduct: { id: sellerProduct.id } },
    });

    const total = reviews.reduce((sum, review) => sum + review.productRating, 0);
    const average = reviews.length > 0 ? total / reviews.length : 0;

    sellerProduct.avgProductRate = Number(average.toFixed(2));
    await this.sellerProductRepository.save(sellerProduct);
  }

  private async updateSellerRatingAverage(seller: Sellers): Promise<void> {
    const reviews = await this.reviewRepository.find({
      where: { seller: { id: seller.id }, sellerRating: Not(IsNull()) },
    });

    const total = reviews.reduce((sum, review) => sum + (review.sellerRating ?? 0), 0);
    const average = reviews.length > 0 ? total / reviews.length : 0;

    seller.averageRating = Number(average.toFixed(2));
    await this.sellerRepository.save(seller);
  }

  async getSellerReviews(sellerId: number): Promise<SellerReviewResponseDtoWrapper> {
    const reviews = await this.reviewRepository.find({
      where: {
        seller: { id: sellerId },
        sellerRating: Not(IsNull()),
      },
      relations: ['seller', 'sellerProduct', 'sellerProduct.product'],
    });

    const mappedReviews = this.mapper.mapArray(reviews, Reviews, SellerReviewResponseDto);

    return {
      success: true,
      message: 'Satıcı yorumları başarıyla alındı',
      data: mappedReviews,
    };
  }

  async getProductReviews(productId: number): Promise<ProductReviewResponseDtoWrapper> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: [
        'sellerProducts',
        'sellerProducts.product',
        'sellerProducts.seller',
        'sellerProducts.reviews',
        'sellerProducts.reviews.customer',
        'sellerProducts.reviews.customer.user',
      ],
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    const productReviews: ProductReviewResponseDto[] = [];

    for (const sellerProduct of product.sellerProducts || []) {
      const reviews = sellerProduct.reviews || [];

      for (const review of reviews) {
        const dto = this.mapper.map(review, Reviews, ProductReviewResponseDto);

        dto.productName = sellerProduct.product?.name || 'Bilinmeyen Ürün';
        dto.sellerName = sellerProduct.seller?.storeName || 'Bilinmeyen Satıcı';

        productReviews.push(dto);
      }
    }

    return {
      success: true,
      message: 'Ürün yorumları başarıyla alındı',
      data: productReviews,
    };
  }
}
