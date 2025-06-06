import { Test, TestingModule } from '@nestjs/testing';
import { OrderDetailService } from './order-detail.service';
import { Repository } from 'typeorm';
import { OrderDetails } from 'src/typeorm/order.details.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Dictionary} from '@automapper/core';
import { OrderDetailResponseDto } from 'src/common/dtos/responseDtos/orderDetail/order.detail.response.dto';
import { NotFoundException } from '@nestjs/common';
import { getMapperToken } from '@automapper/nestjs';

describe('OrderDetailService', () => {
  let service: OrderDetailService;
  let repository: jest.Mocked<Repository<OrderDetails>>;
  let mapper: { mapArray: jest.Mock };

  beforeEach(async () => {
    const mockMapper = {
      mapArray: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderDetailService,
        {
          provide: getRepositoryToken(OrderDetails),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getMapperToken(),
          useValue: mockMapper,
        },
      ],
    }).compile();

    service = module.get<OrderDetailService>(OrderDetailService);
    repository = module.get(getRepositoryToken(OrderDetails));
    mapper = module.get(getMapperToken());
  
  });

  describe('getOrderDetailsForCustomer', () => {
    it('should return mapped order details when found', async () => {
      const customerId = 1;
      const orderId = 100;

      const mockOrderDetailEntity = [{ id: 1 }] as unknown as OrderDetails[];
      const mockMappedDto: OrderDetailResponseDto[] = [
        {
          id: 1,
          seller: {
            sellerId: 1,
            storeName: 'Test Store',
            sellerImage: 'store.png',
            sellerAverageRate: 4.5,
            storeAddress: 'Test Address',
            taxNumber: '123456',
          },
          sellerProduct: {
            id: 10,
            seller: {
              sellerId: 1,
              storeName: 'Test Store',
              sellerImage: 'store.png',
              sellerAverageRate: 4.5,
              storeAddress: 'Test Address',
              taxNumber: '123456',
            },
            product: {
              id: 5,
              name: 'Product Name',
              category: {
                id: 1,
                categoryId: 'ELECTRONICS',
                subCategoryId: 'MOBILE_PHONES',
              },
              description: 'Description',
              productImageUrl: 'img.png',
              basePrice: 100,
            },
            price: 90,
            productImageUrl: 'img.png',
            size: 'M',
            discountPrice: 80,
            stock: 10,
            avgRating: 4.2,
          },
          quantity: 2,
          orderNumber: 'ORD123456',
          unitPrice: 80,
          totalPrice: 160,
        },
      ];

      repository.find.mockResolvedValue(mockOrderDetailEntity);
      mapper.mapArray.mockReturnValue(mockMappedDto as unknown as Dictionary<any>[]);

      const result = await service.getOrderDetailsForCustomer(
        customerId,
        orderId,
      );

      expect(repository.find).toHaveBeenCalledWith({
        where: { order: { id: orderId, customer: { id: customerId } } },
        relations: [
          'order',
          'order.seller',
          'sellerProduct',
          'sellerProduct.product',
        ],
      });
      expect(mapper.mapArray).toHaveBeenCalledWith(
        mockOrderDetailEntity,
        OrderDetails,
        OrderDetailResponseDto,
      );
      expect(result).toEqual(mockMappedDto);
    });

    it('should throw NotFoundException when no order details found', async () => {
      repository.find.mockResolvedValue([]);

      await expect(service.getOrderDetailsForCustomer(1, 100)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getOrderDetailsForSeller', () => {
    it('should return mapped order details when found', async () => {
      const sellerId = 2;
      const orderId = 200;

      const mockOrderDetailEntity = [{ id: 2 }] as unknown as OrderDetails[];
      const mockMappedDto = [{ id: 2 }] as OrderDetailResponseDto[];

      repository.find.mockResolvedValue(mockOrderDetailEntity);
      mapper.mapArray.mockReturnValue(mockMappedDto as unknown as Dictionary<any>[]);

      const result = await service.getOrderDetailsForSeller(sellerId, orderId);

      expect(repository.find).toHaveBeenCalledWith({
        where: { order: { id: orderId, seller: { id: sellerId } } },
        relations: [
          'order',
          'order.seller',
          'sellerProduct',
          'sellerProduct.product',
        ],
      });
      expect(mapper.mapArray).toHaveBeenCalledWith(
        mockOrderDetailEntity,
        OrderDetails,
        OrderDetailResponseDto,
      );
      expect(result).toEqual(mockMappedDto);
    });

    it('should throw NotFoundException when no order details found', async () => {
      repository.find.mockResolvedValue([]);

      await expect(service.getOrderDetailsForSeller(2, 200)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
