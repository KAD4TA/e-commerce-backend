import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { createMapper } from '@automapper/core';
import { classes } from '@automapper/classes';
import { ProductService } from './product.service';
import { Products, SellerProduct, Categories } from 'src/typeorm';
import { ProductPriceService } from 'src/product-price/product-price.service';
import { CategoryEnum } from 'src/common/enums/category.enum';
import { ProductProfile } from 'src/mapping/product.mapping';
import { SellerProductProfile } from 'src/mapping/seller.product.mapping';
import { SellerProfile } from 'src/mapping/seller.mapping';
import { CategoryProfile } from 'src/mapping/category.mapping';


describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Repository<Products>;
  let sellerProductRepository: Repository<SellerProduct>;
  let categoryRepository: Repository<Categories>;
  let productPriceService: ProductPriceService;

  
  const mockProducts = [
    {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      basePrice: 100,
      productImageUrl: 'test-image.jpg',
      category: { id: 1, categoryId: CategoryEnum.ELECTRONICS, subCategoryId: 101 },
      sellerProducts: [
        { id: 1, price: 100, discountPrice: 80, productImageUrl: 'seller-image1.jpg', seller: { id: 1, storeName: 'Seller1' } },
        { id: 2, price: 120, discountPrice: null, productImageUrl: 'seller-image2.jpg', seller: { id: 2, storeName: 'Seller2' } },
      ],
    },
  ];

  const mockSellerProducts = [
    {
      id: 1,
      price: 100,
      discountPrice: 80,
      productImageUrl: 'seller-image1.jpg',
      size: 'M',
      stock: 10,
      avgProductRate: 4.5,
      seller: { id: 1, storeName: 'Seller1', user: { id: 1 } },
      product: { id: 1, name: 'Test Product' },
      favorites: [{ id: 1 }],
    },
    {
      id: 2,
      price: 120,
      discountPrice: null,
      productImageUrl: 'seller-image2.jpg',
      size: 'L',
      stock: 5,
      avgProductRate: 4.0,
      seller: { id: 2, storeName: 'Seller2', user: { id: 2 } },
      product: { id: 1, name: 'Test Product' },
      favorites: [],
    },
  ];

  const mockProductResponseDto = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    basePrice: 80,
    productImageUrl: 'seller-image1.jpg',
    category: { id: 1, categoryId: CategoryEnum.ELECTRONICS, subCategoryId: 101 },
    avgRating: 4.25,
  };

  const mockSellerProductDetailedResponseDto = {
    id: 1,
    price: 100,
    discountPrice: 80,
    productImageUrl: 'seller-image1.jpg',
    size: 'M',
    stock: 10,
    avgRating: 4.5,
    favoriteCount: 1,
    seller: { id: 1, storeName: 'Seller1' },
    product: { id: 1, name: 'Test Product' },
    otherSellers: [
      {
        id: 2,
        sellerName: 'Seller2',
        productName: 'Test Product',
        price: 120,
        discountPrice: null,
        productImageUrl: 'seller-image2.jpg',
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(), 
        }),
      ],
      providers: [
        ProductService,
        SellerProfile,
        CategoryProfile,
        ProductProfile, 
        SellerProductProfile, 
        {
          provide: getRepositoryToken(Products),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([mockProducts, mockProducts.length]),
            }),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SellerProduct),
          useValue: {
            find: jest.fn().mockResolvedValue(mockSellerProducts),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Categories),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: ProductPriceService,
          useValue: {
            updateBasePriceAndImage: jest.fn().mockResolvedValue(undefined),
            getOtherSellers: jest.fn().mockReturnValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get(getRepositoryToken(Products));
    sellerProductRepository = module.get(getRepositoryToken(SellerProduct));
    categoryRepository = module.get(getRepositoryToken(Categories));
    productPriceService = module.get(ProductPriceService);
  });

  describe('findAll', () => {
    it('should return paginated products with filters', async () => {
      const result = await service.findAll('ELECTRONICS', 'Seller1', 'Test', 1, 10);

      expect(productRepository.createQueryBuilder).toHaveBeenCalled();
      expect(productRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledWith('product.category', 'category');
      expect(productRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledWith('product.sellerProducts', 'sellerProduct');
      expect(productRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledWith('sellerProduct.seller', 'seller');
      expect(productRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith('category.categoryId = :categoryEnumValue', { categoryEnumValue: CategoryEnum.ELECTRONICS });
      expect(productRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith('LOWER(seller.storeName) LIKE LOWER(:sellerName)', { sellerName: '%Seller1%' });
      expect(productRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith('LOWER(product.name) LIKE LOWER(:productName)', { productName: '%Test%' });
      expect(productRepository.createQueryBuilder().skip).toHaveBeenCalledWith(0);
      expect(productRepository.createQueryBuilder().take).toHaveBeenCalledWith(10);
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Ürünler başarıyla getirildi',
          meta: { total: 1, page: 1, limit: 10 },
        }),
      );
    });

    it('should handle no seller products', async () => {
      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ ...mockProducts[0], sellerProducts: [] }], 1]),
      } as any);

      const result = await service.findAll(undefined, undefined, undefined, 1, 10);

      expect(result.data[0].basePrice).toBe(-1);
      expect(result.data[0].productImageUrl).toBe('test-image.jpg');
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Ürünler başarıyla getirildi',
          meta: { total: 1, page: 1, limit: 10 },
        }),
      );
    });

    it('should throw error for invalid category', async () => {
      await expect(service.findAll('INVALID', undefined, undefined, 1, 10)).rejects.toThrow('Geçersiz kategori adı: INVALID');
    });
  });

  describe('getProductAllSellers', () => {
    it('should return seller products for a given product ID', async () => {
      const result = await service.getProductAllSellers(1);

      expect(sellerProductRepository.find).toHaveBeenCalledWith({
        where: { product: { id: 1 } },
        relations: ['seller', 'seller.user', 'product', 'favorites'],
      });
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Ürün ve diğer satıcılar başarıyla getirildi',
        }),
      );
    });

    it('should return empty result for non-existing product', async () => {
      jest.spyOn(sellerProductRepository, 'find').mockResolvedValue([]);
      const result = await service.getProductAllSellers(999);

      expect(sellerProductRepository.find).toHaveBeenCalledWith({
        where: { product: { id: 999 } },
        relations: ['seller', 'seller.user', 'product', 'favorites'],
      });
      expect(result).toEqual({
        data: [],
        success: false,
        message: 'Ürün bulunamadı',
      });
    });
  });
});