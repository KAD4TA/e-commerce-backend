import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { ReviewService } from './review.service';
import {
  Reviews,
  SellerProduct,
  Products,
  Customers,
  Sellers,
  Orders,
  Users,
  Cart,
  Categories,
} from 'src/typeorm';
import { ReviewProfile } from 'src/mapping/review.mapping';
import { ReviewRequestDto } from 'src/common/dtos/requestDtos/review/review.request.dto';
import {
  ReviewResponseDto,
  
} from 'src/common/dtos/responseDtos/review/review.response.dto';
import {
  ProductReviewResponseDto,
  ProductReviewResponseDtoWrapper,
} from 'src/common/dtos/responseDtos/review/product.review.dto';
import {
  SellerReviewResponseDto,
  SellerReviewResponseDtoWrapper,
} from 'src/common/dtos/responseDtos/review/seller.review.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoryEnum, SubCategoryEnum } from 'src/common/enums/category.enum';

describe('ReviewService', () => {
  let service: ReviewService;
  let reviewRepository: Repository<Reviews>;
  let sellerProductRepository: Repository<SellerProduct>;
  let productRepository: Repository<Products>;
  let customerRepository: Repository<Customers>;
  let sellerRepository: Repository<Sellers>;
  let orderRepository: Repository<Orders>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        ReviewService,
        {
          provide: getRepositoryToken(Reviews),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(SellerProduct),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Products),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Customers),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Sellers),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Orders),
          useClass: Repository,
        },
        ReviewProfile,
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    reviewRepository = module.get<Repository<Reviews>>(getRepositoryToken(Reviews));
    sellerProductRepository = module.get<Repository<SellerProduct>>(getRepositoryToken(SellerProduct));
    productRepository = module.get<Repository<Products>>(getRepositoryToken(Products));
    customerRepository = module.get<Repository<Customers>>(getRepositoryToken(Customers));
    sellerRepository = module.get<Repository<Sellers>>(getRepositoryToken(Sellers));
    orderRepository = module.get<Repository<Orders>>(getRepositoryToken(Orders));
  });

  describe('createReview', () => {
    const reviewData: ReviewRequestDto = {
      sellerProductId: 1,
      productRate: 4,
      productReview: 'Great product!',
      reviewImage: 'image-url',
      sellerRate: 5,
      sellerReview: 'Excellent service!',
    };

    const category: Categories = {
      id: 1,
      categoryId: CategoryEnum.ELECTRONICS,
      subCategoryId: SubCategoryEnum.MOBILE_PHONES,
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const seller: Sellers = {
      id: 1,
      storeName: 'Test Store',
      storeAddress: 'Test Address',
      taxNumber: '1234567890',
      user: { id: 1, name: 'Test Seller' } as Users,
      sellerProducts: [],
      orders: [],
      reviews: [],
      averageRating: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const product: Products = {
      id: 1,
      name: 'Test Product',
      category,
      description: 'Product description',
      basePrice: 250,
      favorites: [],
      productImageUrl: 'productimage.png',
      sellerProducts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const sellerProduct: SellerProduct = {
      id: 1,
      seller,
      product,
      price: 100,
      avgProductRate: 0,
      cartItems: [],
      reviews: [],
      favorites: [],
      discountPrice: undefined,
      size: 'M',
      productImageUrl: 'image-url',
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const customer: Customers = {
      id: 1,
      address: 'Test Address',
      city: 'Test City',
      user: { id: 1, name: 'Test User' } as Users,
      orders: [],
      orderDetails: [],
      reviews: [],
      carts: [],
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const cart: Cart = {
      id: 1,
      customer,
      cartItems: [],
      shipPrice: 0,
      totalPrice: 0,
      orders: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const order: Orders = {
      id: 1,
      orderNumber: '123e4567-e89b-12d3-a456-426614174000',
      seller,
      customer,
      cart,
      orderDetails: [],
      totalPrice: 100,
      shipPrice: 10,
      status: 'Pending',
      generateOrderNumber: jest.fn(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const review: Reviews = {
      id: 1,
      customer,
      sellerProduct,
      seller,
      productRating: 4,
      productReviewText: 'Great product!',
      productReviewImage: 'image-url',
      sellerRating: 5,
      sellerReviewText: 'Excellent service!',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const reviewResponse: ReviewResponseDto = {
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
    };

    it('should create a review successfully', async () => {
      jest.spyOn(sellerProductRepository, 'findOne').mockResolvedValue(sellerProduct);
      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(order),
      } as any);
      jest.spyOn(customerRepository, 'findOne').mockResolvedValue(customer);
      jest.spyOn(reviewRepository, 'create').mockReturnValue(review);
      jest.spyOn(reviewRepository, 'save').mockResolvedValue(review);
      jest.spyOn(reviewRepository, 'find').mockResolvedValue([review]);
      jest.spyOn(sellerProductRepository, 'save').mockResolvedValue(sellerProduct);
      jest.spyOn(sellerRepository, 'save').mockResolvedValue({
        ...seller,
        averageRating: 5,
      });

      const result = await service.createReview(1, reviewData);

      expect(result.data).toEqual(reviewResponse);
      expect(sellerProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['seller', 'product'],
      });
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(reviewRepository.save).toHaveBeenCalledWith(review);
      expect(sellerProductRepository.save).toHaveBeenCalledWith(sellerProduct);
      expect(sellerRepository.save).toHaveBeenCalledWith({
        ...seller,
        averageRating: 5,
      });
    });

    it('should throw NotFoundException if seller product not found', async () => {
      jest.spyOn(sellerProductRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createReview(1, reviewData)).rejects.toThrow(NotFoundException);
      expect(sellerProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['seller', 'product'],
      });
    });

    it('should throw BadRequestException if product not purchased', async () => {
      jest.spyOn(sellerProductRepository, 'findOne').mockResolvedValue(sellerProduct);
      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.createReview(1, reviewData)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if customer not found', async () => {
      jest.spyOn(sellerProductRepository, 'findOne').mockResolvedValue(sellerProduct);
      jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(order),
      } as any);
      jest.spyOn(customerRepository, 'findOne').mockResolvedValue(null);

      await expect(service.createReview(1, reviewData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSellerProducts', () => {
    const seller: Sellers = {
      id: 1,
      storeName: 'Test Store',
      storeAddress: 'Test Address',
      taxNumber: '1234567890',
      user: { id: 1, name: 'Test Seller' } as Users,
      sellerProducts: [],
      orders: [],
      reviews: [],
      averageRating: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const category: Categories = {
      id: 1,
      categoryId: CategoryEnum.ELECTRONICS,
      subCategoryId: SubCategoryEnum.MOBILE_PHONES,
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const product: Products = {
      id: 1,
      name: 'Test Product',
      category,
      description: 'Product description',
      basePrice: 250,
      favorites: [],
      productImageUrl: 'productimage.png',
      sellerProducts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const sellerProduct: SellerProduct = {
      id: 1,
      seller,
      product,
      price: 100,
      avgProductRate: 0,
      cartItems: [],
      reviews: [],
      favorites: [],
      discountPrice: undefined,
      size: 'M',
      productImageUrl: 'image-url',
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const customer: Customers = {
      id: 1,
      address: 'Test Address',
      city: 'Test City',
      user: { id: 1, name: 'Test User' } as Users,
      orders: [],
      orderDetails: [],
      reviews: [],
      carts: [],
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const reviews: Reviews[] = [
      {
        id: 1,
        seller,
        sellerRating: 5,
        sellerReviewText: 'Great service!',
        sellerProduct,
        productRating: 4,
        productReviewText: 'Great product!',
        productReviewImage: 'image-url',
        createdAt: new Date(),
        updatedAt: new Date(),
        customer,
      },
    ];

    const reviewResponse: SellerReviewResponseDto[] = [
      {
        sellerId: 1,
        sellerName: 'Test Store',
        sellerRate: 5,
        sellerReview: 'Great service!',
      },
    ];

    it('should return seller reviews', async () => {
      jest.spyOn(reviewRepository, 'find').mockResolvedValue(reviews);

      const result = await service.getSellerReviews(1);

      expect(result.data).toEqual(reviewResponse);
      expect(reviewRepository.find).toHaveBeenCalledWith({
        where: { seller: { id: 1 }, sellerRating: expect.anything() },
        relations: ['seller', 'sellerProduct', 'sellerProduct.product'],
      });
    });

    it('should return empty array if no reviews exist', async () => {
      jest.spyOn(reviewRepository, 'find').mockResolvedValue([]);

      const result = await service.getSellerReviews(1);
      expect(result.data).toEqual([]);
    });
  });

  describe('getProductReviews', () => {
    const category: Categories = {
      id: 1,
      categoryId: CategoryEnum.ELECTRONICS,
      subCategoryId: SubCategoryEnum.MOBILE_PHONES,
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const seller: Sellers = {
      id: 1,
      storeName: 'Test Store',
      storeAddress: 'Test Address',
      taxNumber: '1234567890',
      user: { id: 1, name: 'Test Seller' } as Users,
      sellerProducts: [],
      orders: [],
      reviews: [],
      averageRating: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const product: Products = {
      id: 1,
      name: 'Test Product',
      category,
      description: 'Product description',
      basePrice: 250,
      favorites: [],
      productImageUrl: 'productimage.png',
      sellerProducts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const sellerProduct: SellerProduct = {
      id: 1,
      seller,
      product,
      price: 100,
      avgProductRate: 0,
      cartItems: [],
      reviews: [],
      favorites: [],
      discountPrice: undefined,
      size: 'M',
      productImageUrl: 'image-url',
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const customer: Customers = {
      id: 1,
      address: 'Test Address',
      city: 'Test City',
      user: { id: 1, name: 'Test User' } as Users,
      orders: [],
      orderDetails: [],
      reviews: [],
      carts: [],
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const review: Reviews = {
      id: 1,
      productRating: 4,
      productReviewText: 'Great product!',
      productReviewImage: 'image-url',
      customer,
      seller,
      sellerProduct,
      createdAt: new Date(),
      updatedAt: new Date(),
      sellerRating: 5,
      sellerReviewText: 'Great service!',
    };

    product.sellerProducts = [
      {
        ...sellerProduct,
        reviews: [review],
      },
    ];

    const reviewResponse: ProductReviewResponseDto[] = [
      {
        customerName: 'Test User',
        productName: 'Test Product',
        productRate: 4,
        productReview: 'Great product!',
        reviewImage: 'image-url',
        sellerName: 'Test Store',
      },
    ];

    it('should return product reviews', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(product);

      const result = await service.getProductReviews(1);

      expect(result.data).toEqual(reviewResponse);
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [
          'sellerProducts',
          'sellerProducts.product',
          'sellerProducts.seller',
          'sellerProducts.reviews',
          'sellerProducts.reviews.customer',
          'sellerProducts.reviews.customer.user',
        ],
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getProductReviews(1)).rejects.toThrow(NotFoundException);
    });

    it('should return empty array if no reviews exist for product', async () => {
      const emptyProduct: Products = {
        ...product,
        sellerProducts: [{ ...sellerProduct, reviews: [] }],
      };
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(emptyProduct);

      const result = await service.getProductReviews(1);
      expect(result.data).toEqual([]);
    });
  });
});