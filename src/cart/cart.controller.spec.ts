import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart, CartItem, Customers, SellerProduct } from 'src/typeorm';
import { PriceCalculationService } from 'src/price-calculation/price-calculation.service';
import { OrderService } from 'src/order/order.service';

import {
  NotFoundException,
  ForbiddenException,
  
} from '@nestjs/common';
import { CartRequestDto } from 'src/common/dtos/requestDtos/cart/cart.request.dto';
import {
  CartResponseDto,
} from 'src/common/dtos/responseDtos/cart/cart.response.dto';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { CustomerGuard } from 'src/guards/role.customer.guard';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  // Mocks
  const cartRepository = {
    manager: {
      transaction: jest.fn(),
    },
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const customerRepository = {
    findOne: jest.fn(),
  };

  const cartItemRepository = {
    findOne: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
  };

  const sellerProductRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    }),
  };

  const priceCalculationService = {
    calculatePrices: jest.fn(),
  };

  const orderService = {
    createOrder: jest.fn(),
  };

  const mockMapper = {
    map: jest.fn(),
    mapArray: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };
  const mockEntityManager = {
  getRepository: jest.fn()
}

  const mockCustomerGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Cart),
          useValue: cartRepository,
        },
        {
          provide: getRepositoryToken(Customers),
          useValue: customerRepository,
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: cartItemRepository,
        },
        {
          provide: getRepositoryToken(SellerProduct),
          useValue: sellerProductRepository,
        },
        {
          provide: PriceCalculationService,
          useValue: priceCalculationService,
        },
        {
          provide: OrderService,
          useValue: orderService,
        },
        {
          provide: 'automapper:nestjs:default',
          useValue: mockMapper,
        },
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard,
        },
        {
          provide: CustomerGuard,
          useValue: mockCustomerGuard,
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should create a cart successfully', async () => {
      const customerId = 1;
      const cartRequestDto: CartRequestDto = {
        cartItems: [
          { sellerProductId: 10, quantity: 2 },
          { sellerProductId: 20, quantity: 1 },
        ],
        shipPrice: 45,
        totalPrice: 145,
      };

      const customer = {
        id: customerId,
        user: {
          id: 100,
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          telephoneNumber: '1234567890',
        },
        address: '123 Main St',
        city: 'Istanbul',
      };

      const cart = {
        id: 1000,
        customer,
        cartItems: [
          {
            id: 1,
            sellerProduct: {
              id: 10,
              price: 50,
              product: { id: 101, name: 'Product 1' },
              seller: { id: 1 },
              productImageUrl: 'url1',
              size: 'M',
            },
            quantity: 2,
          },
          {
            id: 2,
            sellerProduct: {
              id: 20,
              price: 45,
              product: { id: 102, name: 'Product 2' },
              seller: { id: 2 },
              productImageUrl: 'url2',
              size: 'L',
            },
            quantity: 1,
          },
        ],
        isActive: true,
        totalPrice: 145,
        shipPrice: 45,
      };

      const cartResponseDto: CartResponseDto = {
        cartId: 1000,
        customerName: 'John',
        customerLastName: 'Doe',
        customerAddress: '123 Main St',
        customerCity: 'Istanbul',
        customerEmail: 'john@example.com',
        customerTelephoneNumber: '1234567890',
        cartItems: [
          {
            id: 1,
            sellerProductId: 10,
            sellerProductName: 'Product 1',
            storeName: 'store',
            sellerProductImageUrl: 'url1',
            size: 'M',
            quantity: 2,
            price: 50,
          },
          {
            id: 2,
            sellerProductId: 20,
            sellerProductName: 'Product 2',
            storeName: 'store',
            sellerProductImageUrl: 'url2',
            size: 'L',
            quantity: 1,
            price: 45,
          },
        ],
        totalPrice: 145,
        shipPrice: 45,
        isActive: true,
        subtotal: 145,
      };

      cartRepository.manager.transaction.mockImplementation(async (cb) => {
        return cb({
          findOne: async (entity, options) => {
            if (entity === Customers) return customer;
            if (entity === SellerProduct) {
              if (options.where.id === 10)
                return {
                  id: 10,
                  stock: 5,
                  price: 50,
                  seller: { id: 1 },
                  product: { id: 101, name: 'Product 1' },
                  productImageUrl: 'url1',
                  size: 'M',
                };
              if (options.where.id === 20)
                return {
                  id: 20,
                  stock: 3,
                  price: 45,
                  seller: { id: 2 },
                  product: { id: 102, name: 'Product 2' },
                  productImageUrl: 'url2',
                  size: 'L',
                };
              return null;
            }
            if (entity === Cart && options.where.id === 1000) return cart;
            return null;
          },
          save: async (entity, cartEntity) => ({ ...cartEntity, id: 1000 }),
          create: jest.fn((cls, data) => data),
        });
      });

      priceCalculationService.calculatePrices.mockResolvedValue({
        subtotal: 145,
        shipPrice: 45,
        totalPrice: 190,
      });

      mockMapper.map.mockImplementation((source, sourceClass, destClass) => {
        if (destClass === Cart)
          return { ...source, customer, cartItems: [], isActive: true };
        if (destClass === CartResponseDto) return cartResponseDto;
        if (sourceClass === CartItem && destClass === 'CartItemResponseDto') {
          return {
            id: source.id,
            sellerProductId: source.sellerProduct.id,
            sellerProductName: source.sellerProduct.product.name,
            sellerProductImageUrl: source.sellerProduct.productImageUrl,
            size: source.sellerProduct.size,
            quantity: source.quantity,
            price: source.sellerProduct.price,
            storeName: 'store',
          };
        }
        return source;
      });

      const result = await controller.addToCart(cartRequestDto, customerId);

      expect(result).toEqual({
        success: true,
        message: 'Successfully added to cart',
        data: cartResponseDto,
      });
      expect(cartRepository.manager.transaction).toHaveBeenCalledTimes(1);
      expect(priceCalculationService.calculatePrices).toHaveBeenCalled();
      expect(mockMapper.map).toHaveBeenCalledWith(
        expect.anything(),
        Cart,
        CartResponseDto,
      );
    });

    it('should throw NotFoundException if customer not found', async () => {
      const customerId = 999;
      const cartRequestDto: CartRequestDto = {
        cartItems: [],
        shipPrice: 0,
        totalPrice: 0,
      };

      cartRepository.manager.transaction.mockImplementation(async (cb) => {
        return cb({
          findOne: async () => null,
        });
      });

      await expect(
        controller.addToCart(cartRequestDto, customerId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserCart', () => {
    it('should return active cart for user', async () => {
      const userCustomer = 1;
      const cart = {
        id: 1,
        customer: {
          id: userCustomer,
          user: {
            id: 100,
            name: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            telephoneNumber: '1234567890',
          },
          address: '123 Main St',
          city: 'Istanbul',
        },
        cartItems: [],
        isActive: true,
        totalPrice: 0,
        shipPrice: 0,
      };

      const cartResponseDto: CartResponseDto = {
        cartId: 1,
        customerName: 'John',
        customerLastName: 'Doe',
        customerAddress: '123 Main St',
        customerCity: 'Istanbul',
        customerEmail: 'john@example.com',
        customerTelephoneNumber: '1234567890',
        cartItems: [],
        totalPrice: 0,
        shipPrice: 0,
        isActive: true,
        subtotal: 0,
      };

      cartRepository.findOne.mockResolvedValue(cart);
      mockMapper.map.mockImplementation((source, sourceClass, destClass) => {
        if (destClass === CartResponseDto) return cartResponseDto;
        return source;
      });
      priceCalculationService.calculatePrices.mockResolvedValue({
        subtotal: 0,
        shipPrice: 0,
        totalPrice: 0,
      });

      const result = await controller.getUserCart(userCustomer);

      expect(result).toEqual({
        success: true,
        message: 'Sepet başarıyla alındı',
        data: cartResponseDto,
      });
      expect(cartRepository.findOne).toHaveBeenCalledWith({
        where: { customer: { id: userCustomer }, isActive: true },
        relations: [
          'customer',
          'customer.user',
          'cartItems',
          'cartItems.sellerProduct',
          'cartItems.sellerProduct.product',
        ],
      });
    });

    it('should throw NotFoundException if cart not found', async () => {
      cartRepository.findOne.mockResolvedValue(null);

      await expect(controller.getUserCart(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCart', () => {
    it('should update cart successfully', async () => {
      const cartId = 1;
      const cartRequestDto: CartRequestDto = {
        cartItems: [
          { sellerProductId: 10, quantity: 2 },
          { sellerProductId: 20, quantity: 1 },
        ],
        shipPrice: 45,
        totalPrice: 145,
      };

      const existingCart = {
        id: cartId,
        isActive: true,
        cartItems: [
          {
            id: 1,
            sellerProduct: {
              id: 10,
              price: 50,
              product: { id: 100, name: 'Product 1' },
              productImageUrl: 'url1',
              size: 'M',
            },
            quantity: 1,
          },
        ],
        customer: {
          id: 1,
          user: {
            id: 100,
            name: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            telephoneNumber: '1234567890',
          },
          address: '123 Main St',
          city: 'Istanbul',
        },
        totalPrice: 50,
        shipPrice: 45,
      };

      const updatedCart = {
        ...existingCart,
        cartItems: [
          {
            id: 1,
            sellerProduct: {
              id: 10,
              price: 50,
              product: { id: 100, name: 'Product 1' },
              productImageUrl: 'url1',
              size: 'M',
            },
            quantity: 2,
          },
          {
            id: 2,
            sellerProduct: {
              id: 20,
              price: 45,
              product: { id: 102, name: 'Product 2' },
              productImageUrl: 'url2',
              size: 'L',
            },
            quantity: 1,
          },
        ],
        totalPrice: 145,
        shipPrice: 45,
      };

      const cartResponseDto: CartResponseDto = {
        cartId: 1,
        customerName: 'John',
        customerLastName: 'Doe',
        customerAddress: '123 Main St',
        customerCity: 'Istanbul',
        customerEmail: 'john@example.com',
        customerTelephoneNumber: '1234567890',
        cartItems: [
          {
            id: 1,
            sellerProductId: 10,
            sellerProductName: 'Product 1',
            storeName: 'store',
            sellerProductImageUrl: 'url1',
            size: 'M',
            quantity: 2,
            price: 50,
          },
          {
            id: 2,
            sellerProductId: 20,
            sellerProductName: 'Product 2',
            storeName: 'store',
            sellerProductImageUrl: 'url2',
            size: 'L',
            quantity: 1,
            price: 45,
          },
        ],
        totalPrice: 145,
        shipPrice: 45,
        isActive: true,
        subtotal: 145,
      };

      cartRepository.manager.transaction.mockImplementation(async (cb) => {
        return cb({
          findOne: jest.fn().mockImplementation((entity, options) => {
            if (entity === Cart && options.where.id === cartId && options.where.isActive) {
              return existingCart;
            }
            if (entity === Cart && options.where.id === updatedCart.id) {
              return updatedCart;
            }
            if (entity === SellerProduct && options.where.id === 10) {
              return {
                id: 10,
                stock: 5,
                price: 50,
                seller: { id: 1 },
                product: { id: 100, name: 'Product 1' },
                productImageUrl: 'url1',
                size: 'M',
              };
            }
            if (entity === SellerProduct && options.where.id === 20) {
              return {
                id: 20,
                stock: 3,
                price: 45,
                seller: { id: 2 },
                product: { id: 102, name: 'Product 2' },
                productImageUrl: 'url2',
                size: 'L',
              };
            }
            return null;
          }),
          save: jest.fn().mockImplementation((entity, cartEntity) => cartEntity),
          remove: jest.fn(),
          create: jest.fn().mockImplementation((cls, data) => ({ ...data })),
        });
      });

      priceCalculationService.calculatePrices.mockResolvedValue({
        subtotal: 145,
        shipPrice: 45,
        totalPrice: 145,
      });

      mockMapper.map.mockImplementation((source, sourceClass, destClass) => {
        if (destClass === CartResponseDto) {
          return cartResponseDto;
        }
        return source;
      });

      const result = await controller.updateCart(cartId, cartRequestDto);

      expect(result).toEqual({
        success: true,
        message: 'Sepet başarıyla güncellendi',
        data: cartResponseDto,
      });
      expect(cartRepository.manager.transaction).toHaveBeenCalled();
      expect(priceCalculationService.calculatePrices).toHaveBeenCalled();
    });

    it('should throw NotFoundException if cart not found', async () => {
      cartRepository.manager.transaction.mockImplementation(async (cb) => {
        return cb({
          findOne: jest.fn().mockResolvedValue(null),
        });
      });

      await expect(
        controller.updateCart(999, {
          cartItems: [],
          shipPrice: 0,
          totalPrice: 0,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirmCart', () => {
    it('should confirm cart and create orders', async () => {
      const customerId = 1;
      const cart = {
        id: 1,
        customer: {
          id: customerId,
          user: {
            id: 100,
            name: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            telephoneNumber: '1234567890',
          },
          address: '123 Main St',
          city: 'Istanbul',
        },
        cartItems: [
          {
            id: 11,
            quantity: 2,
            sellerProduct: {
              id: 101,
              price: 50,
              seller: { id: 1 },
              product: { id: 1001, name: 'Product 1' },
              productImageUrl: 'url1',
              size: 'M',
            },
          },
          {
            id: 12,
            quantity: 3,
            sellerProduct: {
              id: 102,
              price: 30,
              seller: { id: 2 },
              product: { id: 1002, name: 'Product 2' },
              productImageUrl: 'url2',
              size: 'L',
            },
          },
        ],
        isActive: true,
        totalPrice: 190,
        shipPrice: 45,
      };

      const customer = {
        id: customerId,
        user: {
          id: 100,
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          telephoneNumber: '1234567890',
        },
        address: '123 Main St',
        city: 'Istanbul',
      };

      const orderResponse = {
        success: true,
        data: {
          id: 123,
          orderNumber: 'ORD123',
          customer,
          totalPrice: 100,
          shipPrice: 45,
          status: 'Pending',
        },
        message: 'Order created',
      };

      cartRepository.manager.transaction.mockImplementation(async (cb) => {
        return cb({
          findOne: async (entity, options) => {
            if (entity === Cart) return cart;
            if (entity === Customers) return customer;
            if (entity === SellerProduct) {
              if (options.where.id === 101)
                return {
                  id: 101,
                  stock: 10,
                  price: 50,
                  seller: { id: 1 },
                  product: { id: 1001, name: 'Product 1' },
                  productImageUrl: 'url1',
                  size: 'M',
                };
              if (options.where.id === 102)
                return {
                  id: 102,
                  stock: 10,
                  price: 30,
                  seller: { id: 2 },
                  product: { id: 1002, name: 'Product 2' },
                  productImageUrl: 'url2',
                  size: 'L',
                };
              return null;
            }
            return null;
          },
          update: jest.fn(),
        });
      });

      orderService.createOrder.mockResolvedValue(orderResponse);

      const result = await controller.confirmCart(customerId);

      expect(result.orders).toHaveLength(2);
      expect(result.message).toContain('Sepet onaylandı');
      expect(cartRepository.manager.transaction).toHaveBeenCalled();
      expect(orderService.createOrder).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException if no active cart found', async () => {
      cartRepository.manager.transaction.mockImplementation(async (cb) => {
        return cb({
          findOne: async (entity) => null,
        });
      });

      await expect(controller.confirmCart(1)).rejects.toThrow(
        new NotFoundException(
          'Müşteri için aktif sepet bulunamadı (ID: 1)',
        ),
      );
    });
  });

  describe('removeCartItem', () => {
    it('should remove cart item successfully', async () => {
      const cartItemId = 1;
      const userId = 1;

      const cartItem = {
        id: cartItemId,
        cart: {
          id: 1,
          customer: {
            id: userId,
            user: {
              id: 100,
              name: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              telephoneNumber: '1234567890',
            },
            address: '123 Main St',
            city: 'Istanbul',
          },
          cartItems: [
            {
              id: cartItemId,
              sellerProduct: {
                id: 10,
                price: 50,
                product: { id: 101, name: 'Product 1' },
                productImageUrl: 'url1',
                size: 'M',
              },
              quantity: 1,
            },
          ],
          isActive: true,
          totalPrice: 50,
          shipPrice: 45,
        },
        sellerProduct: {
          id: 10,
          price: 50,
          product: { id: 101, name: 'Product 1' },
          productImageUrl: 'url1',
          size: 'M',
        },
        quantity: 1,
      };

      cartRepository.manager.transaction.mockImplementation(async (cb) => {
        return cb({
          findOne: async (entity, options) => {
            if (entity === CartItem && options.where.id === cartItemId) {
              return cartItem;
            }
            if (entity === Cart) return cartItem.cart;
            return null;
          },
          save: jest.fn().mockResolvedValue(cartItem.cart),
          remove: jest.fn().mockResolvedValue(cartItem),
        });
      });

      priceCalculationService.calculatePrices.mockResolvedValue({
        subtotal: 0,
        shipPrice: 0,
        totalPrice: 0,
      });

      const result = await controller.removeCartItem(userId, cartItemId);

      expect(result).toEqual({
        success: true,
        message: 'Cart item removed successfully',
      });
      expect(cartRepository.manager.transaction).toHaveBeenCalled();
      expect(priceCalculationService.calculatePrices).toHaveBeenCalled();
    });

    it('should throw NotFoundException if cart item not found', async () => {
      const cartItemId = 1;
      const userId = 1;

      cartRepository.manager.transaction.mockImplementation(async (cb) => {
        return cb({
          findOne: async () => null,
        });
      });

      await expect(controller.removeCartItem(userId, cartItemId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the cart item', async () => {
      const cartItemId = 1;
      const userId = 1;
      const cartItem = {
        id: cartItemId,
        cart: {
          id: 1,
          customer: { id: 2 }, 
          isActive: true,
        },
      };

      cartRepository.manager.transaction.mockImplementation(async (cb) => {
        return cb({
          findOne: async (entity, options) => {
            if (entity === CartItem && options.where.id === cartItemId)
              return cartItem;
            return null;
          },
        });
      });

      await expect(
        controller.removeCartItem(userId, cartItemId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});