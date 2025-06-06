import { Test, TestingModule } from '@nestjs/testing';
import { SellerProductService } from './seller-product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SellerProduct, Products, Categories, Sellers } from 'src/typeorm';
import { Repository } from 'typeorm';
import { ProductPriceService } from 'src/product-price/product-price.service';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { ProductProfile } from 'src/mapping/product.mapping';
import { SellerProfile } from 'src/mapping/seller.mapping'; 
import { ProductRequestDto } from 'src/common/dtos/requestDtos/product/product.request.dto';
import { UpdateProductRequestDto } from 'src/common/dtos/requestDtos/product/update.product.request.dto';
import { SellerProductBasicListResponseDtoWrapper, SellerProductBasicResponseDto } from 'src/common/dtos/responseDtos/seller/seller.product.basic.response.dto';
import { SellerProductDetailedListResponseDtoWrapper } from 'src/common/dtos/responseDtos/seller/seller.product.detailed.response.dto';
import { NotFoundException } from '@nestjs/common';

import { CategoryEnum, SubCategoryEnum } from 'src/common/enums/category.enum';
import { Users } from 'src/typeorm/users.entity';
import { Role } from 'src/common/enums/role.enum';
import { SellerProductProfile } from 'src/mapping/seller.product.mapping';
import { CategoryProfile } from 'src/mapping/category.mapping';

describe('SellerProductService', () => {
  let service: SellerProductService;
  let sellerProductRepository: Repository<SellerProduct>;
  let productRepository: Repository<Products>;
  let categoryRepository: Repository<Categories>;
  let productPriceService: ProductPriceService;

  const mockCategory: Categories = {
    id: 1,
    categoryId: CategoryEnum.ELECTRONICS,
    subCategoryId: SubCategoryEnum.MOBILE_PHONES,
    products: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser: Users = {
    id: 1,
    email: 'seller@example.com',
    userImage: 'seller-image.jpg',
    name: 'John',
    lastName: 'Doe',
    telephoneNumber: '123456789',
    password: 'hashedPassword',
    role: Role.SELLER,
    refreshToken: undefined,
    customer: null,
    seller: null,
    admin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProduct: Products = {
    id: 1,
    name: 'Laptop',
    description: 'High-end laptop',
    category: mockCategory,
    productImageUrl: 'laptop.jpg',
    basePrice: 1000,
    sellerProducts: [],
    favorites: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSeller: Sellers = {
    id: 1,
    user: mockUser,
    storeName: 'Tech Store',
    storeAddress: '123 Tech St',
    taxNumber: '123456789',
    sellerProducts: [],
    orders: [],
    reviews: [],
    averageRating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSellerProduct: SellerProduct = {
    id: 1,
    seller: mockSeller,
    product: mockProduct,
    price: 1200,
    discountPrice: 1000,
    size: 'Medium',
    stock: 50,
    productImageUrl: 'laptop.jpg',
    avgProductRate: 4.0,
    favorites: [],
    cartItems: [],
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductRequestDto: ProductRequestDto = {
    productName: 'Laptop',
    productDescription: 'High-end laptop',
    productCategoryId: 1,
    productSubCategoryId: 1,
    productUnitPrice: 1200,
    productDiscountedPrice: 1000,
    size: 'Medium',
    productStock: 50,
    productImageUrl: 'laptop.jpg',
  };

  const mockUpdateProductRequestDto: UpdateProductRequestDto = {
    productName: 'Updated Laptop',
    productDescription: 'Updated high-end laptop',
    productCategoryId: 1,
    productUnitPrice: 1300,
    productDiscountedPrice: 1100,
    size: 'Large',
    productStock: 60,
    productImageUrl: 'updated-laptop.jpg',
  };

  const mockSellerProductBasicResponseDto: SellerProductBasicResponseDto = {
    id: 1,
    seller: {
      sellerId: 1,
      storeName: 'Tech Store',
      storeAddress: '123 Tech St',
      taxNumber: '123456789',
      sellerAverageRate: 4.5,
      sellerImage: 'seller-image.jpg', // Updated to match SellerResponseDto
    },
    product: {
      id: 1,
      name: 'Laptop',
      description: 'High-end laptop',
      category: { id: 1, categoryId: "ELECTRONICS", subCategoryId: "MOBILE_PHONES" },
      productImageUrl: 'laptop.jpg',
      basePrice: 1000,
    },
    price: 1200,
    productImageUrl: 'laptop.jpg',
    size: 'Medium',
    discountPrice: 1000,
    stock: 50,
    avgRating: 4.0,
  };

  const mockSellerProductRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockCategoryRepository = {
    findOne: jest.fn(),
  };

  const mockProductPriceService = {
    updateProductBasePriceAndImage: jest.fn(),
    getOtherSellers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [
        SellerProductService,
        SellerProductProfile,
        ProductProfile,
        CategoryProfile,
        SellerProfile, // Add SellerProfile to the providers
        {
          provide: getRepositoryToken(SellerProduct),
          useValue: mockSellerProductRepository,
        },
        {
          provide: getRepositoryToken(Products),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Categories),
          useValue: mockCategoryRepository,
        },
        {
          provide: ProductPriceService,
          useValue: mockProductPriceService,
        },
      ],
    }).compile();

    service = module.get<SellerProductService>(SellerProductService);
    sellerProductRepository = module.get<Repository<SellerProduct>>(getRepositoryToken(SellerProduct));
    productRepository = module.get<Repository<Products>>(getRepositoryToken(Products));
    categoryRepository = module.get<Repository<Categories>>(getRepositoryToken(Categories));
    productPriceService = module.get<ProductPriceService>(ProductPriceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a new product and seller product successfully', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.findOne.mockResolvedValue(null);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockSellerProductRepository.save.mockResolvedValue(mockSellerProduct);
      mockSellerProductRepository.findOne.mockResolvedValue(mockSellerProduct);
      mockProductPriceService.updateProductBasePriceAndImage.mockResolvedValue(undefined);
      mockProductPriceService.getOtherSellers.mockReturnValue([]);

      const result = await service.createProduct(mockProductRequestDto, 1);

      expect(result).toBeInstanceOf(SellerProductDetailedListResponseDtoWrapper);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Ürün başarıyla oluşturuldu veya satıcıya bağlandı');
      expect(result.data[0].id).toBe(1);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(mockSellerProductRepository.save).toHaveBeenCalled();
      expect(mockProductPriceService.updateProductBasePriceAndImage).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if category is not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.createProduct(mockProductRequestDto, 1)).rejects.toThrow(NotFoundException);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should link existing product to seller if product exists', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockSellerProductRepository.save.mockResolvedValue(mockSellerProduct);
      mockSellerProductRepository.findOne.mockResolvedValue(mockSellerProduct);
      mockProductPriceService.updateProductBasePriceAndImage.mockResolvedValue(undefined);
      mockProductPriceService.getOtherSellers.mockReturnValue([]);

      const result = await service.createProduct(mockProductRequestDto, 1);

      expect(result.success).toBe(true);
      expect(mockProductRepository.save).not.toHaveBeenCalled();
      expect(mockSellerProductRepository.save).toHaveBeenCalled();
    });

    it('should throw Error if seller information is missing', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockSellerProductRepository.save.mockResolvedValue(mockSellerProduct);
      mockSellerProductRepository.findOne.mockResolvedValue({ ...mockSellerProduct, seller: null });

      await expect(service.createProduct(mockProductRequestDto, 1)).rejects.toThrow('Seller bilgisi bulunamadı');
    });
  });

  describe('updateSellerProduct', () => {
    it('should update a seller product successfully', async () => {
      mockSellerProductRepository.findOne.mockResolvedValue(mockSellerProduct);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockSellerProductRepository.save.mockResolvedValue(mockSellerProduct);

      const result = await service.updateSellerProduct(1, mockUpdateProductRequestDto, 1);

      expect(result).toBeInstanceOf(SellerProductBasicListResponseDtoWrapper);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Ürün başarıyla güncellendi');
      expect(result.data[0].id).toBe(1);
      expect(mockSellerProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, seller: { id: 1 } },
        relations: ['seller', 'product', 'product.category'],
      });
      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(mockSellerProductRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if seller product is not found', async () => {
      mockSellerProductRepository.findOne.mockResolvedValue(null);

      await expect(service.updateSellerProduct(1, mockUpdateProductRequestDto, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if category is not found', async () => {
      mockSellerProductRepository.findOne.mockResolvedValue(mockSellerProduct);
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.updateSellerProduct(1, mockUpdateProductRequestDto, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a seller product successfully', async () => {
      mockSellerProductRepository.findOne.mockResolvedValue(mockSellerProduct);
      mockSellerProductRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteProduct(1, 1);

      expect(result).toEqual({ message: 'Ürün başarıyla silindi' });
      expect(mockSellerProductRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if seller product is not found', async () => {
      mockSellerProductRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteProduct(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
});