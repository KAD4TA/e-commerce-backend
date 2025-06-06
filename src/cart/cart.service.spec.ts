import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { CartService } from './cart.service';
import {
  Cart,
  CartItem,
  Customers,
  SellerProduct,
  Sellers,
  Users,
  Products,
  Categories,
} from 'src/typeorm';
import { PriceCalculationService } from 'src/price-calculation/price-calculation.service';
import { OrderService } from 'src/order/order.service';
import { CartRequestDto } from 'src/common/dtos/requestDtos/cart/cart.request.dto';
import { CartResponseDto } from 'src/common/dtos/responseDtos/cart/cart.response.dto';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CartProfile } from 'src/mapping/cart.mapping';
import { Role } from 'src/common/enums/role.enum';
import { Mapper } from '@automapper/core';


const createMockUser = (role: Role): Users => ({
  id: 1,
  name: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'hashedPassword',
  telephoneNumber: '555-123-123',
  role,
  userImage: 'default.png',
  refreshToken: undefined,
  customer: null,
  seller: null,
  admin: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
});

// Mock Customer User
const mockCustomerUser: Users = createMockUser(Role.CUSTOMER);

// Mock Customer entity
const mockCustomer: Customers = {
  id: 1,
  address: '123 Street',
  city: 'Istanbul',
  user: mockCustomerUser,
  orders: [],
  orderDetails: [],
  reviews: [],
  carts: [],
  favorites: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock Seller User
const mockSellerUser: Users = createMockUser(Role.SELLER);

// Mock Seller entity
const mockSeller: Sellers = {
  id: 1,
  storeName: 'Test Store',
  storeAddress: '456 Street',
  taxNumber: '1234567890',
  user: mockSellerUser,
  createdAt: new Date(),
  updatedAt: new Date(),
  sellerProducts: [],
  orders: [],
  reviews: [],
  averageRating: 0,
};

// Set up relationships
mockCustomerUser.customer = mockCustomer;
mockSellerUser.seller = mockSeller;

// Mock Category
const mockCategory: Categories = {
  id: 1,
  categoryId: 1,
  subCategoryId: 102,
  products: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock Product
const mockProduct: Products = {
  id: 3,
  name: 'Sample Product',
  description: 'Test Description',
  basePrice: 80,
  productImageUrl: 'test-image.jpg',
  sellerProducts: [],
  category: mockCategory,
  favorites: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock SellerProduct
const mockSellerProduct: SellerProduct = {
  id: 1,
  price: 100,
  discountPrice: 80,
  stock: 10,
  productImageUrl: 'test-image.jpg',
  size: 'M',
  avgProductRate: 0,
  seller: mockSeller,
  product: mockProduct,
  cartItems: [],
  reviews: [],
  favorites: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock CartItem
const mockCartItem: CartItem = {
  id: 1,
  sellerProduct: mockSellerProduct,
  quantity: 3,
  cart: null as any, 
};

// Mock Cart
const mockCart: Cart = {
  id: 1,
  customer: mockCustomer,
  cartItems: [mockCartItem],
  totalPrice: 240, // 3 x discountPrice (80) = 240
  shipPrice: 0,
  isActive: true,
  orders: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Complete relationships
mockCartItem.cart = mockCart;
mockCustomer.carts = [mockCart];

// Mock CartRequestDto
const mockCartRequestDto: CartRequestDto = {
  cartItems: [
    {
      sellerProductId: 1,
      quantity: 3,
    },
  ],
  shipPrice: 0,
  totalPrice: 240,
};

// Mock CartResponseDto
const mockCartResponseDto: CartResponseDto = {
  cartId: 1,
  customerName: 'John',
  customerLastName: 'Doe',
  customerAddress: '123 Street',
  customerCity: 'Istanbul',
  customerEmail: 'john.doe@example.com',
  customerTelephoneNumber: '555-1234',
  cartItems: [
    {
      id: 1,
      sellerProductId: 1,
      storeName: 'Test Store',
      sellerProductName: 'Sample Product',
      sellerProductImageUrl: 'test-image.jpg',
      size: 'M',
      quantity: 3,
      price: 100,
      discountPrice: 80,
    },
  ],
  subtotal: 240, // 3 * 80 (discountPrice)
  shipPrice: 0,
  totalPrice: 240,
  isActive: true,
};

// Mock Order Response
const mockOrderResponseDtoWrapper = {
  data: { id: 1, totalPrice: 240 },
  success: true,
  message: 'Sipariş başarıyla oluşturuldu',
};

// Mock Price Details
const mockPriceDetails = {
  subtotal: 240,
  shipPrice: 0,
  totalPrice: 240,
};

describe('CartService', () => {
  let service: CartService;
  let cartRepository: Repository<Cart>;
  let customerRepository: Repository<Customers>;
  let cartItemRepository: Repository<CartItem>;
  let sellerProductRepository: Repository<SellerProduct>;
  let priceCalculationService: PriceCalculationService;
  let orderService: OrderService;
  let mapper: Mapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        CartService,
        CartProfile,
        {
          provide: getRepositoryToken(Cart),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockCart),
            save: jest.fn().mockResolvedValue(mockCart),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            manager: {
              transaction: jest.fn().mockImplementation((cb) =>
                cb({
                  findOne: jest.fn().mockImplementation((entity, options) => {
                    if (entity === Customers && options.where.id === 1)
                      return mockCustomer;
                    if (entity === SellerProduct && options.where.id === 1)
                      return mockSellerProduct;
                    if (entity === Cart && options.where.id === 1)
                      return mockCart;
                    if (
                      entity === Cart &&
                      options.where.customer?.id === 1 &&
                      options.where.isActive
                    )
                      return mockCart;
                    if (entity === CartItem && options.where.id === 1)
                      return { ...mockCartItem, cart: mockCart };
                    return null;
                  }),
                  save: jest.fn().mockResolvedValue(mockCart),
                  remove: jest.fn().mockResolvedValue(undefined),
                  create: jest.fn().mockImplementation((entity, data) => ({
                    ...data,
                    id: data.id || 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  })),
                  createQueryBuilder: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnThis(),
                    leftJoinAndSelect: jest.fn().mockReturnThis(),
                    getOne: jest.fn().mockResolvedValue(mockSellerProduct),
                  }),
                }),
              ),
            },
          },
        },
        {
          provide: getRepositoryToken(Customers),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockCustomer),
          },
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: {
            findOne: jest
              .fn()
              .mockResolvedValue({ ...mockCartItem, cart: mockCart }),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getRepositoryToken(SellerProduct),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockSellerProduct),
          },
        },
        {
          provide: PriceCalculationService,
          useValue: {
            calculatePrices: jest.fn().mockResolvedValue(mockPriceDetails),
          },
        },
        {
          provide: OrderService,
          useValue: {
            createOrder: jest
              .fn()
              .mockResolvedValue(mockOrderResponseDtoWrapper),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get(getRepositoryToken(Cart));
    customerRepository = module.get(getRepositoryToken(Customers));
    cartItemRepository = module.get(getRepositoryToken(CartItem));
    sellerProductRepository = module.get(getRepositoryToken(SellerProduct));
    priceCalculationService = module.get(PriceCalculationService);
    orderService = module.get(OrderService);
    mapper = module.get<Mapper>(getMapperToken());
  });

  describe('createCart', () => {
    
    it('should throw NotFoundException if customer not found', async () => {
      cartRepository.manager.transaction = jest.fn().mockImplementation((cb) =>
        cb({
          findOne: jest.fn().mockImplementation((entity, options) => {
            if (entity === Customers && options.where.id === 1) return null;
            return mockCustomer;
          }),
          save: jest.fn().mockResolvedValue(mockCart),
          remove: jest.fn().mockResolvedValue(undefined),
          create: jest.fn().mockImplementation((entity, data) => ({
            ...data,
            id: data.id || 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(mockSellerProduct),
          }),
        }),
      );

      await expect(service.createCart(mockCartRequestDto, 1)).rejects.toThrow(
        new NotFoundException('Customer with ID 1 not found'),
      );
    });

    it('should throw NotFoundException if seller product not found', async () => {
      cartRepository.manager.transaction = jest.fn().mockImplementation((cb) =>
        cb({
          findOne: jest.fn().mockImplementation((entity, options) => {
            if (entity === Customers && options.where.id === 1)
              return mockCustomer;
            if (entity === SellerProduct && options.where.id === 1) return null;
            return mockSellerProduct;
          }),
          save: jest.fn().mockResolvedValue(mockCart),
          remove: jest.fn().mockResolvedValue(undefined),
          create: jest.fn().mockImplementation((entity, data) => ({
            ...data,
            id: data.id || 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
          }),
        }),
      );

      await expect(service.createCart(mockCartRequestDto, 1)).rejects.toThrow(
        new NotFoundException('SellerProduct with ID 1 not found'),
      );
    });

    it('should throw NotFoundException if seller is null', async () => {
      cartRepository.manager.transaction = jest.fn().mockImplementation((cb) =>
        cb({
          findOne: jest.fn().mockImplementation((entity, options) => {
            if (entity === Customers && options.where.id === 1)
              return mockCustomer;
            if (entity === SellerProduct && options.where.id === 1)
              return { ...mockSellerProduct, seller: null, product: mockProduct };
            return mockSellerProduct;
          }),
          save: jest.fn().mockResolvedValue(mockCart),
          remove: jest.fn().mockResolvedValue(undefined),
          create: jest.fn().mockImplementation((entity, data) => ({
            ...data,
            id: data.id || 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getOne: jest
              .fn()
              .mockResolvedValue({ ...mockSellerProduct, seller: null, product: mockProduct }),
          }),
        }),
      );

      await expect(service.createCart(mockCartRequestDto, 1)).rejects.toThrow(
        new NotFoundException('Seller not found for product ID 1'),
      );
    });

    it('should throw NotFoundException if product is null', async () => {
      cartRepository.manager.transaction = jest.fn().mockImplementation((cb) =>
        cb({
          findOne: jest.fn().mockImplementation((entity, options) => {
            if (entity === Customers && options.where.id === 1)
              return mockCustomer;
            if (entity === SellerProduct && options.where.id === 1)
              return { ...mockSellerProduct, seller: mockSeller, product: null };
            return mockSellerProduct;
          }),
          save: jest.fn().mockResolvedValue(mockCart),
          remove: jest.fn().mockResolvedValue(undefined),
          create: jest.fn().mockImplementation((entity, data) => ({
            ...data,
            id: data.id || 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getOne: jest
              .fn()
              .mockResolvedValue({ ...mockSellerProduct, seller: mockSeller, product: null }),
          }),
        }),
      );

      await expect(service.createCart(mockCartRequestDto, 1)).rejects.toThrow(
        new NotFoundException('Product details not found for seller product ID 1'),
      );
    });

    it('should throw NotFoundException if insufficient stock', async () => {
      cartRepository.manager.transaction = jest.fn().mockImplementation((cb) =>
        cb({
          findOne: jest.fn().mockImplementation((entity, options) => {
            if (entity === Customers && options.where.id === 1)
              return mockCustomer;
            if (entity === SellerProduct && options.where.id === 1)
              return {
                ...mockSellerProduct,
                stock: 1,
                seller: mockSeller,
                product: mockProduct,
              };
            return mockSellerProduct;
          }),
          save: jest.fn().mockResolvedValue(mockCart),
          remove: jest.fn().mockResolvedValue(undefined),
          create: jest.fn().mockImplementation((entity, data) => ({
            ...data,
            id: data.id || 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getOne: jest
              .fn()
              .mockResolvedValue({
                ...mockSellerProduct,
                stock: 1,
                seller: mockSeller,
                product: mockProduct,
              }),
          }),
        }),
      );

      await expect(service.createCart(mockCartRequestDto, 1)).rejects.toThrow(
        new NotFoundException('Insufficient stock for product ID 1'),
      );
    });
  });

  describe('confirmCart', () => {
    

    it('should throw NotFoundException if no active cart found', async () => {
      cartRepository.manager.transaction = jest.fn().mockImplementation((cb) =>
        cb({
          findOne: jest.fn().mockImplementation((entity, options) => {
            if (entity === Cart && options.where.customer.id === 1) return null;
            return mockCart;
          }),
        }),
      );

      await expect(service.confirmCart(1)).rejects.toThrow(
        new NotFoundException('Müşteri için aktif sepet bulunamadı (ID: 1)'),
      );
    });

    it('should throw NotFoundException if cart is empty', async () => {
      cartRepository.manager.transaction = jest.fn().mockImplementation((cb) =>
        cb({
          findOne: jest.fn().mockImplementation((entity, options) => {
            if (entity === Cart && options.where.customer.id === 1)
              return { ...mockCart, cartItems: [] };
            return mockCart;
          }),
        }),
      );

      await expect(service.confirmCart(1)).rejects.toThrow(
        new NotFoundException(`Sepet boş (ID: ${mockCart.id})`),
      );
    });

    it('should throw NotFoundException if customer not found', async () => {
      cartRepository.manager.transaction = jest.fn().mockImplementation((cb) =>
        cb({
          findOne: jest.fn().mockImplementation((entity, options) => {
            if (entity === Cart && options.where.customer.id === 1)
              return mockCart;
            if (entity === Customers && options.where.id === 1) return null;
            return mockCustomer;
          }),
        }),
      );

      await expect(service.confirmCart(1)).rejects.toThrow(
        new NotFoundException('Müşteri bulunamadı (ID: 1)'),
      );
    });

    it('should throw BadRequestException if stock insufficient', async () => {
      cartRepository.manager.transaction = jest.fn().mockImplementation((cb) =>
        cb({
          findOne: jest.fn().mockImplementation((entity, options) => {
            if (entity === Cart && options.where.customer.id === 1)
              return mockCart;
            if (entity === Customers && options.where.id === 1)
              return mockCustomer;
            if (entity === SellerProduct && options.where.id === 1)
              return { ...mockSellerProduct, stock: 1 };
            return mockSellerProduct;
          }),
        }),
      );

      await expect(service.confirmCart(1)).rejects.toThrow(
        new BadRequestException('Stok yetersiz (SellerProduct ID: 1)'),
      );
    });
  });

  describe('updateCart', () => {
    
    it('should throw NotFoundException if cart not found', async () => {
      cartRepository.manager.transaction = jest.fn().mockImplementation((cb) =>
        cb({
          findOne: jest.fn().mockImplementation((entity, options) => {
            if (entity === Cart && options.where.id === 1) return null;
            return mockCart;
          }),
          save: jest.fn().mockResolvedValue(mockCart),
          remove: jest.fn().mockResolvedValue(undefined),
          create: jest.fn().mockImplementation((entity, data) => ({
            ...data,
            id: data.id || 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(mockSellerProduct),
          }),
        }),
      );

      await expect(service.updateCart(1, mockCartRequestDto)).rejects.toThrow(
        new NotFoundException('Aktif sepet (ID: 1) bulunamadı'),
      );
    });

    it('should throw NotFoundException if cart items are empty', async () => {
      const emptyCartRequestDto: CartRequestDto = {
        cartItems: [],
        shipPrice: 0,
        totalPrice: 0,
      };

      cartRepository.manager.transaction = jest.fn().mockImplementation((cb) =>
        cb({
          findOne: jest.fn().mockImplementation((entity, options) => {
            if (entity === Cart && options.where.id === 1) return mockCart;
            return null;
          }),
          save: jest.fn().mockResolvedValue(mockCart),
          remove: jest.fn().mockResolvedValue(undefined),
          create: jest.fn().mockImplementation((entity, data) => ({
            ...data,
            id: data.id || 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(mockSellerProduct),
          }),
        }),
      );

      await expect(service.updateCart(1, emptyCartRequestDto)).rejects.toThrow(
        new NotFoundException('the basket is not empty'),
      );
    });

    it('should throw NotFoundException if seller product not found', async () => {
      cartRepository.manager.transaction = jest.fn().mockImplementation((cb) =>
        cb({
          findOne: jest.fn().mockImplementation((entity, options) => {
            if (
              entity === Cart &&
              options.where.id === 1 &&
              options.where.isActive === true
            ) {
              return {
                ...mockCart,
                cartItems: [],
                customer: { user: {} },
              };
            }
            return null;
          }),
          save: jest.fn().mockResolvedValue(mockCart),
          remove: jest.fn().mockResolvedValue(undefined),
          create: jest.fn().mockImplementation((entity, data) => ({
            ...data,
            id: data.id || 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          getRepository: jest.fn().mockReturnValue({
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(null),
            }),
          }),
        }),
      );

      await expect(
        service.updateCart(1, {
          cartItems: [{ sellerProductId: 999, quantity: 3 }],
          shipPrice: 45,
          totalPrice: 285,
        }),
      ).rejects.toThrow(new NotFoundException('Ürün (ID: 999) bulunamadı'));
    });
  });

  describe('getUserCart', () => {
    

    it('should throw NotFoundException if no active cart found', async () => {
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getUserCart(1)).rejects.toThrow(
        new NotFoundException('Müşteri (ID: 1) için aktif sepet bulunamadı'),
      );
    });

    it('should throw ForbiddenException if user does not own cart', async () => {
      jest.spyOn(cartRepository, 'findOne').mockResolvedValue({
        ...mockCart,
        customer: { ...mockCustomer, id: 2 },
      });

      await expect(service.getUserCart(1)).rejects.toThrow(
        new ForbiddenException('Bu sepete erişim yetkiniz yok'),
      );
    });
  });

  describe('removeCartItem', () => {
    let mockSave: jest.Mock;
    let mockRemove: jest.Mock;
    let mockFindOne: jest.Mock;
    let mockCalculatePrices: jest.Mock;

    beforeEach(() => {
      mockSave = jest.fn().mockResolvedValue(mockCart);
      mockRemove = jest.fn().mockResolvedValue(undefined);
      mockFindOne = jest.fn().mockResolvedValue({
        ...mockCartItem,
        cart: {
          ...mockCart,
          customer: mockCustomer,
          cartItems: [mockCartItem],
          isActive: true,
        },
      });
      mockCalculatePrices = jest.fn().mockResolvedValue({
        totalPrice: 100,
        shipPrice: 10,
      });

      priceCalculationService.calculatePrices = mockCalculatePrices;

      cartRepository.manager.transaction = jest
        .fn()
        .mockImplementation(async (cb) => {
          const transactionalEntityManager = {
            findOne: mockFindOne,
            save: mockSave,
            remove: mockRemove,
          };
          return cb(transactionalEntityManager);
        });
    });

    it('should remove cart item successfully', async () => {
      const result = await service.removeCartItem(1, 1);

      expect(cartRepository.manager.transaction).toHaveBeenCalled();
      expect(mockCalculatePrices).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(mockRemove).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        message: 'Cart item removed successfully',
      });
    });

    it('should throw NotFoundException if cart item not found', async () => {
      mockFindOne.mockResolvedValueOnce(null);

      await expect(service.removeCartItem(1, 1)).rejects.toThrow(
        new NotFoundException('Sepet öğesi (ID: 1) bulunamadı'),
      );
    });

    it('should throw ForbiddenException if user does not own cart', async () => {
      mockFindOne.mockResolvedValueOnce({
        ...mockCartItem,
        cart: {
          ...mockCart,
          customer: { ...mockCustomer, id: 2 },
          cartItems: [mockCartItem],
          isActive: true,
        },
      });

      await expect(service.removeCartItem(1, 1)).rejects.toThrow(
        new ForbiddenException(
          'Bu sepet öğesini silme yetkiniz yok veya sepet aktif değil',
        ),
      );
    });

    it('should throw ForbiddenException if cart is not active', async () => {
      mockFindOne.mockResolvedValueOnce({
        ...mockCartItem,
        cart: {
          ...mockCart,
          isActive: false,
          customer: mockCustomer,
          cartItems: [mockCartItem],
        },
      });

      await expect(service.removeCartItem(1, 1)).rejects.toThrow(
        new ForbiddenException(
          'Bu sepet öğesini silme yetkiniz yok veya sepet aktif değil',
        ),
      );
    });
  });
});