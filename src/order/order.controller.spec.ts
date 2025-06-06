import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { CustomerGuard } from 'src/guards/role.customer.guard';
import { SellerGuard } from 'src/guards/role.seller.guard';
import { Customers, Sellers } from 'src/typeorm';
import { OrderResponseDtoWrapper, OrderResponseDto } from 'src/common/dtos/responseDtos/order/order.response.dto';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Mock factory for Customers
const createMockCustomer = (partial: Partial<Customers> = {}): Customers => ({
  id: 0,
  user: { id: 1 } as any,
  cart: [],
  orders: [],
  favorites: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...partial,
} as Customers);

// Mock factory for Sellers
const createMockSeller = (partial: Partial<Sellers> = {}): Sellers => ({
  id: 0,
  storeName: 'Test Store',
  storeAddress: '123 Test St',
  taxNumber: 1234567890,
  user: { id: 1 } as any,
  sellerProducts: [],
  orders: [],
  reviews: [],
  averageRating: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...partial,
} as Sellers);

// Mock OrderResponseDto
const createMockOrderResponseDto = (partial: Partial<OrderResponseDto> = {}): OrderResponseDto => ({
  id: 1,
  orderNumber: uuidv4(),
  customer: { customerId: 1 },
  totalPrice: 205,
  shipPrice: 45,
  status: 'Pending',
  ...partial,
} as OrderResponseDto);

// Mock OrderResponseDtoWrapper
const createMockOrderResponseDtoWrapper = (partial: Partial<OrderResponseDtoWrapper> = {}): OrderResponseDtoWrapper => ({
  data: createMockOrderResponseDto(),
  message: 'Sipariş başarıyla getirildi',
  success: true,
  ...partial,
} as OrderResponseDtoWrapper);

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: jest.Mocked<OrderService>;

  beforeEach(async () => {
    const mockOrderService = {
      getCustomerOrders: jest.fn(),
      getSellerOrders: jest.fn(),
      getAllOrders: jest.fn(), 
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CustomerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SellerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get(OrderService);
  });

  describe('getCustomerOrders', () => {
    const customer = createMockCustomer({ id: 1 });
    const orderResponse = [createMockOrderResponseDtoWrapper()];

    it('should return customer orders successfully', async () => {
     
      orderService.getCustomerOrders.mockResolvedValue(orderResponse);

     
      const result = await controller.getCustomerOrders(customer.id);

      expect(result).toEqual(orderResponse);
      expect(orderService.getCustomerOrders).toHaveBeenCalledWith(customer.id);
      expect(orderService.getCustomerOrders).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if no orders found', async () => {
      
      orderService.getCustomerOrders.mockRejectedValue(new NotFoundException('Müşteri için sipariş bulunamadı'));

   
      await expect(controller.getCustomerOrders(customer.id)).rejects.toThrow(NotFoundException);
      expect(orderService.getCustomerOrders).toHaveBeenCalledWith(customer.id);
      expect(orderService.getCustomerOrders).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSellerOrders', () => {
    const seller = createMockSeller({ id: 1 });
    const orderResponse = [createMockOrderResponseDtoWrapper()];

    it('should return seller orders successfully', async () => {
      
      orderService.getSellerOrders.mockResolvedValue(orderResponse);

      
      const result = await controller.getSellerOrders(seller.id);

      expect(result).toEqual(orderResponse);
      expect(orderService.getSellerOrders).toHaveBeenCalledWith(seller.id);
      expect(orderService.getSellerOrders).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if no orders found', async () => {
    
      orderService.getSellerOrders.mockRejectedValue(new NotFoundException('Satıcı için sipariş bulunamadı'));

   
      await expect(controller.getSellerOrders(seller.id)).rejects.toThrow(NotFoundException);
      expect(orderService.getSellerOrders).toHaveBeenCalledWith(seller.id);
      expect(orderService.getSellerOrders).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllOrders', () => {
    const orderResponse = [createMockOrderResponseDtoWrapper()];

    it('should return all orders successfully', async () => {
    
      orderService.getAllOrders.mockResolvedValue(orderResponse);

      const result = await controller.getAllOrders();

      expect(result).toEqual(orderResponse);
      expect(orderService.getAllOrders).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if no orders found', async () => {
      orderService.getAllOrders.mockRejectedValue(new NotFoundException('Sipariş bulunamadı'));

      await expect(controller.getAllOrders()).rejects.toThrow(NotFoundException);
      expect(orderService.getAllOrders).toHaveBeenCalledTimes(1);
    });
  });
});