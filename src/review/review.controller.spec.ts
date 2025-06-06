import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewRequestDto } from 'src/common/dtos/requestDtos/review/review.request.dto';
import { ReviewResponseDtoWrapper } from 'src/common/dtos/responseDtos/review/review.response.dto';
import {
 
  ProductReviewResponseDtoWrapper,
} from 'src/common/dtos/responseDtos/review/product.review.dto';
import {
  SellerReviewResponseDto,
  SellerReviewResponseDtoWrapper,
} from 'src/common/dtos/responseDtos/review/seller.review.dto';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { CustomerGuard } from 'src/guards/role.customer.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ReviewController', () => {
  let controller: ReviewController;
  let reviewService: jest.Mocked<ReviewService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: {
            createReview: jest.fn(),
            getSellerReviews: jest.fn(),
            getProductReviews: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: (context: ExecutionContext) => true })
      .overrideGuard(CustomerGuard)
      .useValue({ canActivate: (context: ExecutionContext) => true })
      .compile();

    controller = module.get<ReviewController>(ReviewController);
    reviewService = module.get(ReviewService);
  });

  describe('createReview', () => {
    it('should create a review and return success response', async () => {
      const customerId = 1;
      const reviewData: ReviewRequestDto = {
        sellerProductId: 1,
        productRate: 4,
        productReview: 'Great product!',
        reviewImage: 'image-url',
        sellerRate: 5,
        sellerReview: 'Excellent service!',
      };

      const reviewResponse: ReviewResponseDtoWrapper = {
        success: true,
        message: 'Yorum başarıyla oluşturuldu',
        data: {
          id: 1,
          customerId: 1,
          sellerProductId: 1,
          sellerId: 1,
          productId: 1,
          productName: 'Test Product',
          productRate: 4,
          productReview: 'Great product!',
          reviewImage: 'image-url',
          sellerRate: 5,
          sellerReview: 'Excellent service!',
          createdAt: new Date(),
        },
      };

      jest.spyOn(reviewService, 'createReview').mockResolvedValue(reviewResponse);

      const result = await controller.createReview(customerId, reviewData);

      expect(result).toEqual(reviewResponse);
      expect(reviewService.createReview).toHaveBeenCalledWith(customerId, reviewData);
    });
  });

  describe('getSellerReviews', () => {
    it('should return seller reviews in a wrapper', async () => {
      const sellerId = 1;
      const sellerReviews: SellerReviewResponseDtoWrapper = {
        success: true,
        message: 'Satıcı yorumları başarıyla alındı',
        data: [
          {
            sellerId: 1,
            sellerName: 'Test Store',
            sellerRate: 5,
            sellerReview: 'Great service!',
          },
        ],
      };

      jest.spyOn(reviewService, 'getSellerReviews').mockResolvedValue(sellerReviews);

      const result = await controller.getSellerProducts(sellerId);

      expect(result).toEqual(sellerReviews);
      expect(reviewService.getSellerReviews).toHaveBeenCalledWith(sellerId);
    });
  });

  describe('getProductReviews', () => {
    it('should return product reviews in a wrapper', async () => {
      const productId = 1;
      const productReviews: ProductReviewResponseDtoWrapper = {
        success: true,
        message: 'Ürün yorumları başarıyla alındı',
        data: [
          {
            customerName: 'Test User',
            productName: 'Test Product',
            productRate: 4,
            productReview: 'Great product!',
            reviewImage: 'image-url',
            sellerName: 'Test Store',
          },
        ],
      };

      jest.spyOn(reviewService, 'getProductReviews').mockResolvedValue(productReviews);

      const result = await controller.getProductSellers(productId);

      expect(result).toEqual(productReviews);
      expect(reviewService.getProductReviews).toHaveBeenCalledWith(productId);
    });
  });
});
