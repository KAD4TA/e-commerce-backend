import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Orders } from 'src/typeorm/orders.entity';
import { Repository } from 'typeorm';
import { getMapperToken } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { NotFoundException } from '@nestjs/common';
import { OrderResponseDto, OrderResponseDtoWrapper } from 'src/common/dtos/responseDtos/order/order.response.dto';
import { PriceCalculationService } from 'src/price-calculation/price-calculation.service';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: jest.Mocked<Repository<Orders>>;
  let mapper: jest.Mocked<Mapper>;

  // Mock repository
  const mockOrderRepo = {
    find: jest.fn(),
  };

  // Mock mapper
  const mockMapper = {
    mapArray: jest.fn(),
  };

  
  const mockPriceCalculationService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Orders),
          useValue: mockOrderRepo,
        },
        {
          provide: getMapperToken(),
          useValue: mockMapper,
        },
        {
          provide: PriceCalculationService,
          useValue: mockPriceCalculationService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepo = module.get(getRepositoryToken(Orders));
    mapper = module.get(getMapperToken());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomerOrders', () => {
  it('should return mapped customer orders wrapped in response', async () => {
    const orders: Orders[] = [{} as Orders];
    const dtos: OrderResponseDto[] = [{
      id: 1,
      orderNumber: 'ORD001',
      customer: {} as any,
      totalPrice: 100,
      shipPrice: 10,
      status: 'Pending',
    }];

    const wrappedResult = dtos.map(dto => new OrderResponseDtoWrapper(dto, 'Sipariş başarıyla getirildi', true));

    orderRepo.find.mockResolvedValue(orders);
    mapper.mapArray.mockReturnValue(dtos as any);

    const result = await service.getCustomerOrders(1);

    expect(orderRepo.find).toHaveBeenCalledWith({
      where: { customer: { id: 1 } },
      relations: expect.any(Array),
    });
    expect(mapper.mapArray).toHaveBeenCalledWith(orders, Orders, OrderResponseDto);
    expect(result).toEqual(wrappedResult);
  });
});

describe('getSellerOrders', () => {
  it('should return mapped seller orders wrapped in response', async () => {
    const orders: Orders[] = [{} as Orders];
    const dtos: OrderResponseDto[] = [{
      id: 1,
      orderNumber: 'ORD002',
      customer: {} as any,
      totalPrice: 150,
      shipPrice: 15,
      status: 'Shipped',
    }];

    const wrappedResult = dtos.map(dto => new OrderResponseDtoWrapper(dto, 'Sipariş başarıyla getirildi', true));

    orderRepo.find.mockResolvedValue(orders);
    mapper.mapArray.mockReturnValue(dtos as any);

    const result = await service.getSellerOrders(1);

    expect(orderRepo.find).toHaveBeenCalledWith({
      where: { seller: { id: 1 } },
      relations: expect.any(Array),
    });
    expect(mapper.mapArray).toHaveBeenCalledWith(orders, Orders, OrderResponseDto);
    expect(result).toEqual(wrappedResult);
  });

  it('should throw NotFoundException if no seller orders found', async () => {
    orderRepo.find.mockResolvedValue([]);

    await expect(service.getSellerOrders(1)).rejects.toThrow(NotFoundException);
    expect(orderRepo.find).toHaveBeenCalled();
  });
});

describe('getAllOrders', () => {
  it('should return all mapped orders wrapped in response', async () => {
    const orders: Orders[] = [{} as Orders];
    const dtos: OrderResponseDto[] = [{
      id: 1,
      orderNumber: 'ORD003',
      customer: {} as any,
      totalPrice: 200,
      shipPrice: 20,
      status: 'Delivered',
    }];

    const wrappedResult = dtos.map(dto => new OrderResponseDtoWrapper(dto, 'Sipariş başarıyla getirildi', true));

    orderRepo.find.mockResolvedValue(orders);
    mapper.mapArray.mockReturnValue(dtos as any);

    const result = await service.getAllOrders();

    expect(orderRepo.find).toHaveBeenCalledWith({
      relations: expect.any(Array),
      order: { createdAt: 'DESC' },
    });
    expect(mapper.mapArray).toHaveBeenCalledWith(orders, Orders, OrderResponseDto);
    expect(result).toEqual(wrappedResult);
  });

  it('should throw NotFoundException if no orders found', async () => {
    orderRepo.find.mockResolvedValue([]);

    await expect(service.getAllOrders()).rejects.toThrow(NotFoundException);
    expect(orderRepo.find).toHaveBeenCalled();
  });
});
});
