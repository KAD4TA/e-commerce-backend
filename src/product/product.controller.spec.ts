import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductResponseDtoWrapper } from 'src/common/dtos/responseDtos/product/product.response.dto';
import { SellerProductDetailedListResponseDtoWrapper } from 'src/common/dtos/responseDtos/seller/seller.product.detailed.response.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  
  const mockProductService = {
    findAll: jest.fn(),
    getProductAllSellers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return ProductResponseDtoWrapper', async () => {
      const mockResponse = new ProductResponseDtoWrapper([], 'Success', true);
      mockResponse.meta = {
        total: 0,
        page: 1,
        limit: 10,
      };

      mockProductService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll('cat', 'seller', 'prod', 1, 10);

      expect(service.findAll).toHaveBeenCalledWith('cat', 'seller', 'prod', 1, 10);
      expect(result).toBe(mockResponse);
      expect(result.meta).toEqual({ total: 0, page: 1, limit: 10 });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Success');
    });
  });

  describe('getProductAllSellers', () => {
    it('should return SellerProductDetailedListResponseDtoWrapper', async () => {
      const mockResponse = new SellerProductDetailedListResponseDtoWrapper([], 'Success', true);
      
      mockProductService.getProductAllSellers.mockResolvedValue(mockResponse);

      const productId = 123;

      const result = await controller.getProductAllSellers(productId);

      expect(service.getProductAllSellers).toHaveBeenCalledWith(productId);
      expect(result).toBe(mockResponse);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Success');
    });
  });
});
