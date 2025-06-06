import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteService } from './favorite.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Favorites, SellerProduct, Customers } from '../typeorm';
import { Mapper } from '@automapper/core';
import { AutomapperModule } from '@automapper/nestjs';
import { FavoriteRequestDto } from '../common/dtos/requestDtos/favorite/favorite.request.dto';
import { FavoriteResponseDto, FavoriteResponseDtoWrapper } from '../common/dtos/responseDtos/favorite/favorite.response.dto';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

// Mock Repositories
const mockFavoriteRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
};

const mockSellerProductRepo = {
  findOne: jest.fn(),
};

// Mock Mapper
const mockMapper = {
  map: jest.fn(),
  mapArray: jest.fn(),
};

describe('FavoriteService', () => {
  let service: FavoriteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AutomapperModule],
      providers: [
        FavoriteService,
        {
          provide: getRepositoryToken(Favorites),
          useValue: mockFavoriteRepo,
        },
        {
          provide: getRepositoryToken(SellerProduct),
          useValue: mockSellerProductRepo,
        },
        {
          provide: 'automapper:nestjs:default',
          useValue: mockMapper,
        },
      ],
    }).compile();

    service = module.get<FavoriteService>(FavoriteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addFavorite', () => {
    const favoriteRequestDto: FavoriteRequestDto = { sellerProductId: 1 };
    const userId = 1;

    const sellerProduct = {
      id: 1,
      product: { id: 1, name: 'Product 1' },
      seller: { id: 1 },
      price: 100,
      discountPrice: 80,
      productImageUrl: 'image.jpg',
      avgProductRate: 4.5,
    };

    const favoriteEntity = {
      id: 1,
      customer: { id: userId },
      sellerProduct,
      product: sellerProduct.product,
    };

    const favoriteResponseDto: FavoriteResponseDto = {
      id: 1,
      productId: 1,
      productName: 'Product 1',
      productImage: 'image.jpg',
      productDiscount: 80,
      productPrice: 100,
      productRate: 4.5,
      sellerId: 1,
    };

    it('should add a favorite successfully', async () => {
      // Arrange
      mockSellerProductRepo.findOne.mockResolvedValue(sellerProduct);
      mockFavoriteRepo.findOne.mockResolvedValue(null); // No existing favorite
      mockFavoriteRepo.save.mockResolvedValue(favoriteEntity);
      mockMapper.map.mockReturnValue(favoriteResponseDto);

      // Act
      const result = await service.addFavorite(favoriteRequestDto, userId);

      // Assert
      expect(mockSellerProductRepo.findOne).toHaveBeenCalledWith({
        where: { id: favoriteRequestDto.sellerProductId },
        relations: ['product', 'seller'],
      });
      expect(mockFavoriteRepo.findOne).toHaveBeenCalledWith({
        where: { customer: { id: userId }, sellerProduct: { id: sellerProduct.id } },
      });
      expect(mockFavoriteRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: { id: userId },
          sellerProduct,
          product: sellerProduct.product,
        }),
      );
      expect(mockMapper.map).toHaveBeenCalledWith(favoriteEntity, Favorites, FavoriteResponseDto);
      expect(result).toEqual(new FavoriteResponseDtoWrapper(favoriteResponseDto, 'Favori başarıyla eklendi', true));
    });

    it('should throw BadRequestException if user ID is invalid (0)', async () => {
      // Act & Assert
      await expect(service.addFavorite(favoriteRequestDto, 0)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if sellerProduct is not found', async () => {
      // Arrange
      mockSellerProductRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.addFavorite(favoriteRequestDto, userId)).rejects.toThrow(BadRequestException);
    });

    it('should return error if product is already in favorites', async () => {
      // Arrange
      mockSellerProductRepo.findOne.mockResolvedValue(sellerProduct);
      mockFavoriteRepo.findOne.mockResolvedValue(favoriteEntity);

      // Act
      const result = await service.addFavorite(favoriteRequestDto, userId);

      // Assert
      expect(result).toEqual(new FavoriteResponseDtoWrapper(null, 'Bu ürün zaten favorilerde!', false));
    });
  });

  describe('deleteFavorite', () => {
    const user: Customers = { id: 1 } as Customers;
    const productId = 1;

    const favorite = {
      id: 1,
      customer: { id: 1 },
      sellerProduct: { id: 1, product: { id: productId } },
    };

    it('should delete a favorite successfully', async () => {
      // Arrange
      mockFavoriteRepo.findOne.mockResolvedValue(favorite);
      mockFavoriteRepo.delete.mockResolvedValue(undefined);

      // Act
      const result = await service.deleteFavorite(productId, 1);

      // Assert
      expect(mockFavoriteRepo.findOne).toHaveBeenCalledWith({
        where: { sellerProduct: { product: { id: productId } }, customer: { id: user.id } },
        relations: ['sellerProduct', 'sellerProduct.product'],
      });
      expect(mockFavoriteRepo.delete).toHaveBeenCalledWith(favorite.id);
      expect(result).toEqual(new FavoriteResponseDtoWrapper(null, 'Favori başarıyla kaldırıldı', true));
    });

    it('should return error if favorite is not found', async () => {
      // Arrange
      mockFavoriteRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await service.deleteFavorite(productId, 1);

      // Assert
      expect(result).toEqual(new FavoriteResponseDtoWrapper(null, 'Favori bulunamadı', false));
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockFavoriteRepo.findOne.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(service.deleteFavorite(productId, 1)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getFavorites', () => {
    const userId = 1;
    const favorites = [
      {
        id: 1,
        customer: { id: userId },
        sellerProduct: {
          id: 1,
          product: { id: 1, name: 'Product 1' },
          price: 100,
          discountPrice: 80,
          productImageUrl: 'image.jpg',
          avgProductRate: 4.5,
          seller: { id: 1 },
        },
      },
    ];

    const favoriteResponseDto: FavoriteResponseDto = {
      id: 1,
      productId: 1,
      productName: 'Product 1',
      productImage: 'image.jpg',
      productDiscount: 80,
      productPrice: 100,
      productRate: 4.5,
      sellerId: 1,
    };

    it('should return favorites successfully', async () => {
      // Arrange
      mockFavoriteRepo.find.mockResolvedValue(favorites);
      mockMapper.mapArray.mockReturnValue([favoriteResponseDto]);

      // Act
      const result = await service.getFavorites(userId);

      // Assert
      expect(mockFavoriteRepo.find).toHaveBeenCalledWith({
        where: { customer: { id: userId } },
        relations: ['sellerProduct', 'sellerProduct.product'],
      });
      expect(mockMapper.mapArray).toHaveBeenCalledWith(favorites, Favorites, FavoriteResponseDto);
      expect(result).toEqual(new FavoriteResponseDtoWrapper([favoriteResponseDto], 'Favoriler başarıyla alındı', true));
    });

    it('should return empty array if no favorites exist', async () => {
      // Arrange
      mockFavoriteRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getFavorites(userId);

      // Assert
      expect(result).toEqual(new FavoriteResponseDtoWrapper([], 'Favori bulunamadı', true));
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockFavoriteRepo.find.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(service.getFavorites(userId)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getSellerFavoriteCounts', () => {
    const sellerId = 1;
    const favorites = [
      {
        id: 1,
        sellerProduct: {
          id: 1,
          product: { id: 1, name: 'Product 1' },
          price: 100,
          discountPrice: 80,
          productImageUrl: 'image.jpg',
          avgProductRate: 4.5,
          seller: { id: sellerId },
        },
      },
      {
        id: 2,
        sellerProduct: {
          id: 1,
          product: { id: 1, name: 'Product 1' },
          price: 100,
          discountPrice: 80,
          productImageUrl: 'image.jpg',
          avgProductRate: 4.5,
          seller: { id: sellerId },
        },
      },
    ];

    const favoriteResponseDto: FavoriteResponseDto = {
      id: 1,
      productId: 1,
      productName: 'Product 1',
      productImage: 'image.jpg',
      productDiscount: 80,
      productPrice: 100,
      productRate: 4.5,
      sellerId: 1,
      favoriteCount: 2,
    };

    it('should return seller favorite counts successfully', async () => {
      // Arrange
      mockFavoriteRepo.find.mockResolvedValue(favorites);
      mockMapper.mapArray.mockReturnValue([favoriteResponseDto]);

      // Act
      const result = await service.getSellerFavoriteCounts(sellerId);

      // Assert
      expect(mockFavoriteRepo.find).toHaveBeenCalledWith({
        where: { sellerProduct: { seller: { id: sellerId } } },
        relations: ['sellerProduct', 'sellerProduct.product'],
      });
      expect(result).toEqual(
        new FavoriteResponseDtoWrapper([favoriteResponseDto], 'Satıcı favori sayıları başarıyla alındı', true),
      );
      if (Array.isArray(result.data)) {
        expect(result.data[0].favoriteCount).toBe(2);
      }
    });

    it('should return empty array if no favorites exist', async () => {
      // Arrange
      mockFavoriteRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getSellerFavoriteCounts(sellerId);

      // Assert
      expect(result).toEqual(
        new FavoriteResponseDtoWrapper([], 'Satıcının ürünleri için favori bulunamadı', true),
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      // Arrange
      mockFavoriteRepo.find.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(service.getSellerFavoriteCounts(sellerId)).rejects.toThrow(InternalServerErrorException);
    });
  });
});