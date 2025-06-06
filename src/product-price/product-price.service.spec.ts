import { Test, TestingModule } from '@nestjs/testing';
import { ProductPriceService } from './product-price.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Products, SellerProduct } from 'src/typeorm';
import { Repository } from 'typeorm';
import { getMapperToken } from '@automapper/nestjs';
import { OtherSellerProductResponseDto } from 'src/common/dtos/responseDtos/seller/other.seller.product.response.dto';

describe('ProductPriceService', () => {
  let service: ProductPriceService;
  let productRepo: Repository<Products>;
  let sellerProductRepo: Repository<SellerProduct>;
  let mapper: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductPriceService,
        {
          provide: getRepositoryToken(Products),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SellerProduct),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getMapperToken(),
          useValue: {
            map: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductPriceService>(ProductPriceService);
    productRepo = module.get<Repository<Products>>(getRepositoryToken(Products));
    sellerProductRepo = module.get<Repository<SellerProduct>>(getRepositoryToken(SellerProduct));
    mapper = module.get(getMapperToken());
  });

  describe('updateProductBasePriceAndImage', () => {
    it('should update product base price and image with the cheapest seller product', async () => {
      const mockProduct = { id: 1, basePrice: 100, productImageUrl: '' } as Products;
      const sellerProducts: SellerProduct[] = [
        { id: 1, price: 100, discountPrice: 90, productImageUrl: 'url1', product: mockProduct, seller: { id: 1 } } as any,
        { id: 2, price: 80, discountPrice: null, productImageUrl: 'url2', product: mockProduct, seller: { id: 2 } } as any,
        { id: 3, price: 95, discountPrice: 85, productImageUrl: 'url3', product: mockProduct, seller: { id: 3 } } as any,
      ];

      jest.spyOn(sellerProductRepo, 'find').mockResolvedValue(sellerProducts);
      const saveSpy = jest.spyOn(productRepo, 'save').mockResolvedValue({} as Products);

      await service.updateProductBasePriceAndImage(1);

      expect(saveSpy).toHaveBeenCalledWith({
        ...mockProduct,
        basePrice: 80,
        productImageUrl: 'url2',
      });
    });

    it('should return early if no seller products are found', async () => {
      jest.spyOn(sellerProductRepo, 'find').mockResolvedValue([]);

      const saveSpy = jest.spyOn(productRepo, 'save');
      await service.updateProductBasePriceAndImage(1);

      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('getOtherSellers', () => {
    it('should return mapped seller products excluding current seller', () => {
      const sellerProducts: SellerProduct[] = [
        { id: 1, seller: { id: 1 }, price: 100 } as any,
        { id: 2, seller: { id: 2 }, price: 120 } as any,
        { id: 3, seller: { id: 3 }, price: 110 } as any,
      ];

      const mapMock = jest.fn()
        .mockReturnValueOnce({ price: 120 } as OtherSellerProductResponseDto)
        .mockReturnValueOnce({ price: 110 } as OtherSellerProductResponseDto);
      mapper.map = mapMock;

      const result = service.getOtherSellers(sellerProducts, 1);

      expect(result).toEqual([
        { price: 120 },
        { price: 110 },
      ]);
      expect(mapper.map).toHaveBeenCalledTimes(2);
    });
  });
});
