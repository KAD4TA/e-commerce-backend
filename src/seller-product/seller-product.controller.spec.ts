import { Test, TestingModule } from '@nestjs/testing';
import { SellerProductController } from './seller-product.controller';
import { SellerProductService } from './seller-product.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { SellerGuard } from 'src/guards/role.seller.guard';
import { ProductRequestDto } from 'src/common/dtos/requestDtos/product/product.request.dto';
import { UpdateProductRequestDto } from 'src/common/dtos/requestDtos/product/update.product.request.dto';
import { SellerProductBasicListResponseDtoWrapper } from 'src/common/dtos/responseDtos/seller/seller.product.basic.response.dto';
import { ExecutionContext } from '@nestjs/common';
import { ProductResponseDto } from 'src/common/dtos/responseDtos/product/product.response.dto';
import { SellerResponseDto } from 'src/common/dtos/responseDtos/seller/seller.response.dto';
import { CategoryResponseDto } from 'src/common/dtos/responseDtos/category/category.response.dto';

// Mock SellerProductService
const mockSellerProductService = {
  createProduct: jest.fn(),
  updateSellerProduct: jest.fn(),
  deleteProduct: jest.fn(),
};

// Mock Guards
const mockJwtAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => true),
};

const mockSellerGuard = {
  canActivate: jest.fn((context: ExecutionContext) => true),
};

// Mock GetSellerUser decorator
const mockSeller = 1; // Mock seller ID

describe('SellerProductController', () => {
  let controller: SellerProductController;
  let sellerProductService: jest.Mocked<SellerProductService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerProductController],
      providers: [
        {
          provide: SellerProductService,
          useValue: mockSellerProductService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(SellerGuard)
      .useValue(mockSellerGuard)
      .compile();

    controller = module.get<SellerProductController>(SellerProductController);
    sellerProductService = module.get<SellerProductService>(SellerProductService) as jest.Mocked<SellerProductService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product and return SellerProductBasicListResponseDtoWrapper', async () => {
      const productRequestDto: ProductRequestDto = {
        productName: 'Test Product',
        productDescription: 'Test Description',
        productCategoryId: 1,
        productSubCategoryId: 1,
        productUnitPrice: 100,
        productDiscountedPrice: 80,
        size: 'M',
        productStock: 50,
        productImageUrl: 'http://test.com/image.jpg',
      };

      const response: SellerProductBasicListResponseDtoWrapper = {
        data: [
          {
            id: 1,
            seller: {
              sellerId: mockSeller,
              storeName: 'Test Store',
              sellerImage: 'http://test.com/seller.jpg',
              sellerAverageRate: 4.5,
              storeAddress: '123 Test St',
              taxNumber: "123456789",
            },
            product: {
              id: 1,
              name: 'Test Product',
              category: { id: 1, categoryId: 'ELECTRONICS',subCategoryId:'MOBILE_PHONES' } as CategoryResponseDto,
              description: 'Test Description',
              productImageUrl: 'http://test.com/image.jpg',
              basePrice: 100,
              avgRating: 0,
            },
            price: 100,
            productImageUrl: 'http://test.com/image.jpg',
            size: 'M',
            discountPrice: 80,
            stock: 50,
            avgRating: 0,
          },
        ],
        message: 'Product created successfully',
        success: true,
      };

      sellerProductService.createProduct.mockResolvedValue(response);

      const result = await controller.createProduct(productRequestDto, mockSeller);

      expect(sellerProductService.createProduct).toHaveBeenCalledWith(productRequestDto, mockSeller);
      expect(result).toEqual(response);
    });

    it('should throw an error if createProduct fails', async () => {
      const productRequestDto: ProductRequestDto = {
        productName: 'Test Product',
        productDescription: 'Test Description',
        productCategoryId: 1,
        productSubCategoryId: 1,
        productUnitPrice: 100,
        productDiscountedPrice: 80,
        size: 'M',
        productStock: 50,
        productImageUrl: 'http://test.com/image.jpg',
      };

      sellerProductService.createProduct.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.createProduct(productRequestDto, mockSeller)).rejects.toThrow('Creation failed');
      expect(sellerProductService.createProduct).toHaveBeenCalledWith(productRequestDto, mockSeller);
    });
  });

  describe('updateProduct', () => {
    it('should update a product and return SellerProductBasicListResponseDtoWrapper', async () => {
      const productId = 1;
      const updateProductRequestDto: UpdateProductRequestDto = {
        productName: 'Updated Product',
        productUnitPrice: 120,
      };

      const response: SellerProductBasicListResponseDtoWrapper = {
        data: [
          {
            id: productId,
            seller: {
              sellerId: mockSeller,
              storeName: 'Test Store',
              sellerImage: 'http://test.com/seller.jpg',
              sellerAverageRate: 4.5,
              storeAddress: '123 Test St',
              taxNumber: "123456789",
            },
            product: {
              id: productId,
              name: 'Updated Product',
              category: { id: 1, categoryId: 'ELECTRONICS',subCategoryId:'MOBILE_PHONES' } as CategoryResponseDto,
              description: 'Test Description',
              productImageUrl: 'http://test.com/image.jpg',
              basePrice: 120,
              avgRating: 0,
            },
            price: 120,
            productImageUrl: 'http://test.com/image.jpg',
            size: 'M',
            discountPrice: 80,
            stock: 50,
            avgRating: 0,
          },
        ],
        message: 'Product updated successfully',
        success: true,
      };

      sellerProductService.updateSellerProduct.mockResolvedValue(response);

      const result = await controller.updateProduct(productId, updateProductRequestDto, mockSeller);

      expect(sellerProductService.updateSellerProduct).toHaveBeenCalledWith(productId, updateProductRequestDto, mockSeller);
      expect(result).toEqual(response);
    });

    it('should throw an error if updateProduct fails', async () => {
      const productId = 1;
      const updateProductRequestDto: UpdateProductRequestDto = {
        productName: 'Updated Product',
      };

      sellerProductService.updateSellerProduct.mockRejectedValue(new Error('Update failed'));

      await expect(controller.updateProduct(productId, updateProductRequestDto, mockSeller)).rejects.toThrow('Update failed');
      expect(sellerProductService.updateSellerProduct).toHaveBeenCalledWith(productId, updateProductRequestDto, mockSeller);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product and return a success message', async () => {
      const productId = 1;
      const response = { message: 'Product deleted successfully' };

      sellerProductService.deleteProduct.mockResolvedValue(response);

      const result = await controller.deleteProduct(productId, mockSeller);

      expect(sellerProductService.deleteProduct).toHaveBeenCalledWith(productId, mockSeller);
      expect(result).toEqual(response);
    });

    it('should throw an error if deleteProduct fails', async () => {
      const productId = 1;

      sellerProductService.deleteProduct.mockRejectedValue(new Error('Deletion failed'));

      await expect(controller.deleteProduct(productId, mockSeller)).rejects.toThrow('Deletion failed');
      expect(sellerProductService.deleteProduct).toHaveBeenCalledWith(productId, mockSeller);
    });
  });
});