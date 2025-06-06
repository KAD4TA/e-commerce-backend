import { Test, TestingModule } from '@nestjs/testing';
import { PriceCalculationService } from './price-calculation.service';
import { SellerProduct, CartItem } from 'src/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';


interface MockCart {
  id: number; 
}

interface MockSellerProduct {
  id: number;
  price: number;
  discountPrice?: number | null;
  product?: any; 
}

interface MockCartItem extends Omit<CartItem, 'cart' | 'sellerProduct'> {
  id: number;
  quantity: number;
  sellerProduct: MockSellerProduct;
  cart: MockCart; 
}

describe('PriceCalculationService', () => {
  let service: PriceCalculationService;
  let sellerProductRepository: {
    findOne: jest.Mock<Promise<SellerProduct | null>>;
    save?: jest.Mock;
    find?: jest.Mock;
  };

  // Constants from the service
  const BASE_SHIPPING_FEE = 45;
  const FREE_SHIPPING_THRESHOLD = 200;

  beforeEach(async () => {
    // Initialize the mock repository
    sellerProductRepository = {
      findOne: jest.fn<Promise<SellerProduct | null>, any>(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceCalculationService,
        {
          provide: getRepositoryToken(SellerProduct),
          useValue: sellerProductRepository,
        },
      ],
    }).compile();

    service = module.get<PriceCalculationService>(PriceCalculationService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculatePrices', () => {
    // Helper function to create a cart item with default values
    const createCartItem = (
      id: number,
      quantity: number,
      sellerProduct: MockSellerProduct,
    ): MockCartItem => ({
      id,
      quantity,
      sellerProduct,
      cart: { id: 1 }, // Mock cart relation
    });

    it('should throw NotFoundException when cartItems is empty', async () => {
      await expect(service.calculatePrices([])).rejects.toThrow(
        new NotFoundException('Sepet öğeleri boş veya geçersiz'),
      );
    });

    it('should throw NotFoundException when cartItems is undefined', async () => {
      await expect(service.calculatePrices(undefined as any)).rejects.toThrow(
        new NotFoundException('Sepet öğeleri boş veya geçersiz'),
      );
    });

    it('should throw NotFoundException when sellerProduct is missing', async () => {
      const cartItems: MockCartItem[] = [
        createCartItem(1, 1, undefined as any),
      ];

      await expect(service.calculatePrices(cartItems as CartItem[])).rejects.toThrow(
        new NotFoundException('Sepet öğesi 1 için ürün bilgisi eksik'),
      );
    });

    it('should throw NotFoundException when sellerProduct id is missing', async () => {
      const cartItems: MockCartItem[] = [
        createCartItem(1, 1, {
          id: undefined as any,
          price: 100,
        }),
      ];

      await expect(service.calculatePrices(cartItems as CartItem[])).rejects.toThrow(
        new NotFoundException('Sepet öğesi 1 için ürün bilgisi eksik'),
      );
    });

    it('should calculate prices correctly with full product info and discount', async () => {
      const cartItems: MockCartItem[] = [
        createCartItem(1, 2, {
          id: 10,
          price: 100,
          discountPrice: 80,
        }),
      ];

      const result = await service.calculatePrices(cartItems as CartItem[]);

      expect(sellerProductRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual({
        subtotal: 160.0,
        shipPrice: BASE_SHIPPING_FEE,
        totalPrice: 160.0 + BASE_SHIPPING_FEE,
      });
    });

    it('should calculate prices correctly with full product info and no discount', async () => {
      const cartItems: MockCartItem[] = [
        createCartItem(1, 3, {
          id: 10,
          price: 50,
          discountPrice: null,
        }),
      ];

      const result = await service.calculatePrices(cartItems as CartItem[]);

      expect(sellerProductRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual({
        subtotal: 150.0,
        shipPrice: BASE_SHIPPING_FEE,
        totalPrice: 150.0 + BASE_SHIPPING_FEE,
      });
    });

    it('should fetch missing product info from repository', async () => {
      const cartItems: MockCartItem[] = [
        createCartItem(1, 1, {
          id: 42,
          price: undefined as any,
          discountPrice: undefined as any,
        }),
      ];

      const dbProduct: MockSellerProduct = {
        id: 42,
        price: 150,
        discountPrice: null,
      };

      sellerProductRepository.findOne.mockResolvedValue(dbProduct as SellerProduct);

      const result = await service.calculatePrices(cartItems as CartItem[]);

      expect(sellerProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 42 },
        relations: ['product'],
      });
      expect(result).toEqual({
        subtotal: 150.0,
        shipPrice: BASE_SHIPPING_FEE,
        totalPrice: 150.0 + BASE_SHIPPING_FEE,
      });
      expect(cartItems[0].sellerProduct).toEqual(dbProduct); 
    });

    it('should apply free shipping when subtotal exceeds threshold', async () => {
      const cartItems: MockCartItem[] = [
        createCartItem(1, 3, {
          id: 5,
          price: 100,
          discountPrice: null,
        }),
      ];

      const result = await service.calculatePrices(cartItems as CartItem[]);

      expect(sellerProductRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual({
        subtotal: 300.0,
        shipPrice: 0,
        totalPrice: 300.0,
      });
    });

    it('should handle multiple cart items with mixed pricing', async () => {
      const cartItems: MockCartItem[] = [
        createCartItem(1, 2, {
          id: 10,
          price: 100,
          discountPrice: 80,
        }),
        createCartItem(2, 1, {
          id: 20,
          price: 50,
          discountPrice: null,
        }),
      ];

      const result = await service.calculatePrices(cartItems as CartItem[]);

      expect(sellerProductRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual({
        subtotal: 160.0 + 50.0, 
        shipPrice: 0, 
        totalPrice: 210.0,
      });
    });

    it('should handle discountPrice of 0', async () => {
      const cartItems: MockCartItem[] = [
        createCartItem(1, 1, {
          id: 10,
          price: 100,
          discountPrice: 0,
        }),
      ];

      const result = await service.calculatePrices(cartItems as CartItem[]);

      expect(sellerProductRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual({
        subtotal: 0.0,
        shipPrice: BASE_SHIPPING_FEE,
        totalPrice: BASE_SHIPPING_FEE,
      });
    });

    it('should throw NotFoundException when sellerProduct not found in DB', async () => {
      const cartItems: MockCartItem[] = [
        createCartItem(1, 1, {
          id: 99,
          price: undefined as any,
          discountPrice: undefined as any,
        }),
      ];

      sellerProductRepository.findOne.mockResolvedValue(null);

      await expect(service.calculatePrices(cartItems as CartItem[])).rejects.toThrow(
        new NotFoundException('Ürün (ID: 99) bulunamadı'),
      );
      expect(sellerProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 99 },
        relations: ['product'],
      });
    });
  });
});