import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';
import { FavoriteRequestDto } from 'src/common/dtos/requestDtos/favorite/favorite.request.dto';
import { FavoriteResponseDto, FavoriteResponseDtoWrapper } from 'src/common/dtos/responseDtos/favorite/favorite.response.dto';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { CustomerGuard } from 'src/guards/role.customer.guard';
import { SellerGuard } from 'src/guards/role.seller.guard';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Mock the Reflector to handle guard metadata
const mockReflector = {
  get: jest.fn().mockReturnValue(undefined),
};

// Mock JwtAuthGuard
@Injectable()
class MockJwtAuthGuard {
  canActivate = jest.fn((context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    request.user = { userId: 1, role: 'CUSTOMER', sellerId: null }; 
    return true;
  });
}

// Mock CustomerGuard
@Injectable()
class MockCustomerGuard {
  canActivate = jest.fn(() => true);
}

// Mock SellerGuard
@Injectable()
class MockSellerGuard {
  canActivate = jest.fn((context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    request.user = { userId: 2, role: 'SELLER', sellerId: 1 }; 
    return true;
  });
}

describe('FavoriteController', () => {
  let controller: FavoriteController;
  let favoriteService: FavoriteService;

  // Mock FavoriteService
  const mockFavoriteService = {
    addFavorite: jest.fn(),
    deleteFavorite: jest.fn(),
    getFavorites: jest.fn(),
    getSellerFavoriteCounts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteController],
      providers: [
        { provide: FavoriteService, useValue: mockFavoriteService },
        { provide: JwtAuthGuard, useClass: MockJwtAuthGuard },
        { provide: CustomerGuard, useClass: MockCustomerGuard },
        { provide: SellerGuard, useClass: MockSellerGuard },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    controller = module.get<FavoriteController>(FavoriteController);
    favoriteService = module.get<FavoriteService>(FavoriteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addFavorite', () => {
    it('should call addFavorite service method and return response', async () => {
      const favoriteDto: FavoriteRequestDto = { sellerProductId: 1 };
      const userId = 1;
      const expectedResponse: FavoriteResponseDtoWrapper = new FavoriteResponseDtoWrapper(
        {
          id: 1,
          productId: 1,
          productImage: 'image.jpg',
          productName: 'Test Product',
          productDiscount: 10,
          productPrice: 100,
          productRate: 4.5,
          sellerId: 1,
        },
        'Favorite added successfully',
        true,
      );

      mockFavoriteService.addFavorite.mockResolvedValue(expectedResponse);

      const result = await controller.addFavorite(favoriteDto, userId);

      expect(mockFavoriteService.addFavorite).toHaveBeenCalledWith(favoriteDto, userId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('deleteFavorite', () => {
    it('should call deleteFavorite service method and return response', async () => {
      const productId = 1;
      const userId = 1;
      const expectedResponse: FavoriteResponseDtoWrapper = new FavoriteResponseDtoWrapper(
        null,
        'Favorite deleted successfully',
        true,
      );

      mockFavoriteService.deleteFavorite.mockResolvedValue(expectedResponse);

      const result = await controller.deleteFavorite(productId, userId);

      expect(mockFavoriteService.deleteFavorite).toHaveBeenCalledWith(productId, userId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getFavorites', () => {
    it('should call getFavorites service method and return response', async () => {
      const userId = 1;
      const expectedResponse: FavoriteResponseDtoWrapper = new FavoriteResponseDtoWrapper(
        [
          {
            id: 1,
            productId: 1,
            productImage: 'image1.jpg',
            productName: 'Test Product 1',
            productDiscount: 10,
            productPrice: 100,
            productRate: 4.5,
            sellerId: 1,
          },
          {
            id: 2,
            productId: 2,
            productImage: 'image2.jpg',
            productName: 'Test Product 2',
            productDiscount: 15,
            productPrice: 150,
            productRate: 4.0,
            sellerId: 1,
          },
        ],
        'Favorites retrieved successfully',
        true,
      );

      mockFavoriteService.getFavorites.mockResolvedValue(expectedResponse);

      const result = await controller.getFavorites(userId);

      expect(mockFavoriteService.getFavorites).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getSellerFavoriteCounts', () => {
    it('should call getSellerFavoriteCounts service method and return response', async () => {
      const sellerId = 1;
      const expectedResponse: FavoriteResponseDtoWrapper = new FavoriteResponseDtoWrapper(
        [
          {
            id: 1,
            productId: 1,
            productImage: 'image.jpg',
            productName: 'Test Product',
            productDiscount: 10,
            productPrice: 100,
            productRate: 4.5,
            sellerId,
            favoriteCount: 10,
          },
        ],
        'Favorite counts retrieved successfully',
        true,
      );

      mockFavoriteService.getSellerFavoriteCounts.mockResolvedValue(expectedResponse);

      const result = await controller.getSellerFavoriteCounts(sellerId);

      expect(mockFavoriteService.getSellerFavoriteCounts).toHaveBeenCalledWith(sellerId);
      expect(result).toEqual(expectedResponse);
    });
  });
});