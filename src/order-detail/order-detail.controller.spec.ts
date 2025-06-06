import { Test, TestingModule } from '@nestjs/testing';
import { OrderDetailController } from './order-detail.controller';
import { OrderDetailService } from './order-detail.service';
import { OrderDetailResponseDto } from 'src/common/dtos/responseDtos/orderDetail/order.detail.response.dto';

describe('OrderDetailController', () => {
  let controller: OrderDetailController;
  let service: OrderDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderDetailController],
      providers: [
        {
          provide: OrderDetailService,
          useValue: {
            getOrderDetailsForCustomer: jest.fn(),
            getOrderDetailsForSeller: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderDetailController>(OrderDetailController);
    service = module.get<OrderDetailService>(OrderDetailService);
  });

  describe('getOrderDetailsForCustomer', () => {
    it('should return order details for customer', async () => {
      const mockResponse: OrderDetailResponseDto[] = [{ id: 1, quantity: 1 } as OrderDetailResponseDto];
      jest.spyOn(service, 'getOrderDetailsForCustomer').mockResolvedValue(mockResponse);

      const result = await controller.getOrderDetailsForCustomer(1, 1);

      expect(result).toEqual(mockResponse);
      expect(service.getOrderDetailsForCustomer).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('getOrderDetailsForSeller', () => {
    it('should return order details for seller', async () => {
      const mockResponse: OrderDetailResponseDto[] = [{ id: 2, quantity: 5 } as OrderDetailResponseDto];
      jest.spyOn(service, 'getOrderDetailsForSeller').mockResolvedValue(mockResponse);

      const result = await controller.getOrderDetailsForSeller(2, 1);

      expect(result).toEqual(mockResponse);
      expect(service.getOrderDetailsForSeller).toHaveBeenCalledWith(2, 1);
    });
  });
});
