import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Orders } from 'src/typeorm/orders.entity';
import { Cart } from 'src/typeorm/cart.entity';
import {
  OrderResponseDto,
  OrderResponseDtoWrapper,
} from 'src/common/dtos/responseDtos/order/order.response.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {  OrderDetails, SellerProduct} from 'src/typeorm';
import { PriceCalculationService } from 'src/price-calculation/price-calculation.service';

@Injectable()
export class OrderService {
  

  constructor(
    @InjectRepository(Orders)
    private readonly orderRepository: Repository<Orders>,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly priceCalculationService: PriceCalculationService,
  ) {}

 async createOrder(
  customerId: number,
  cart: Cart,
  manager: EntityManager,
): Promise<OrderResponseDtoWrapper> {
 

  if (!cart?.cartItems?.length) {
    throw new NotFoundException('Sepet boş veya geçersiz.');
  }

  
  for (const item of cart.cartItems) {
    const sp = await manager.findOne(SellerProduct, {
      where: { id: item.sellerProduct.id },
      relations: ['product', 'seller'],
    });

    if (!sp) {
      throw new NotFoundException(`SellerProduct bulunamadı, ID: ${item.sellerProduct.id}`);
    }
    if (sp.stock < item.quantity) {
      throw new BadRequestException(`Stok yetersiz, ürün ID: ${sp.id}`);
    }
  }

  
  const prices = await this.priceCalculationService.calculatePrices(cart.cartItems);

  const order = manager.create(Orders, {
    customerId,
    seller: cart.cartItems[0].sellerProduct.seller,
    cart,
    totalPrice: prices.totalPrice,
    shipPrice: prices.shipPrice,
  });

  const savedOrder = await manager.save(order);

  
  const orderDetails: OrderDetails[] = [];

  for (const item of cart.cartItems) {
    const sp = await manager.findOne(SellerProduct, {
      where: { id: item.sellerProduct.id },
      relations: ['product'],
    });

    if (!sp?.product) {
      throw new NotFoundException(`Ürün bulunamadı, SellerProduct ID: ${item.sellerProduct.id}`);
    }

    const unitPrice = sp.discountPrice ?? sp.price;

    if (unitPrice == null) {
      throw new InternalServerErrorException(`Birim fiyat atanamamış, SellerProduct ID: ${sp.id}`);
    }

    const totalPrice = unitPrice * item.quantity;

    const detail = manager.create(OrderDetails, {
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      sellerProduct: sp,
      product: sp.product,
      customerId,
      order: savedOrder,
    });

    orderDetails.push(detail);

  
    sp.stock -= item.quantity;
    await manager.save(sp);
  }

  await manager.save(orderDetails);

  savedOrder.orderDetails = orderDetails;
  await manager.save(savedOrder);

  const loadedOrder = await manager.findOne(Orders, {
    where: { id: savedOrder.id },
    relations: [
      'orderDetails',
      'orderDetails.sellerProduct',
      'orderDetails.sellerProduct.product',
      'customer',
      'seller',
    ],
  });

  if (!loadedOrder) {
    throw new NotFoundException('Sepet boş veya geçersiz.');
  }

  const orderDto = this.mapper.map(loadedOrder, Orders, OrderResponseDto);
  return new OrderResponseDtoWrapper(orderDto, 'Sipariş başarıyla oluşturuldu', true);
}



  async getCustomerOrders(customerId: number): Promise<OrderResponseDtoWrapper[]> {
  const orders = await this.orderRepository.find({
    where: { customer: { id: customerId } },
    relations: [
      'orderDetails',
      'orderDetails.sellerProduct',
      'orderDetails.sellerProduct.product',
      'seller',
      'customer',
    ],
  });

  if (!orders.length) {
    throw new NotFoundException('Müşteriye ait sipariş bulunamadı.');
  }

  const dtos = this.mapper.mapArray(orders, Orders, OrderResponseDto);
  return dtos.map(dto => new OrderResponseDtoWrapper(dto, 'Sipariş başarıyla getirildi', true));
}
  async getSellerOrders(seller: number): Promise<OrderResponseDtoWrapper[]> {
    const orders = await this.orderRepository.find({
      where: { seller: { id: seller} },
      relations: [
        'orderDetails',
        'orderDetails.sellerProduct',
        'orderDetails.sellerProduct.product',
        'customer',
        'customer.user',
        'seller',
      ],
    });

    if (!orders.length) {
      throw new NotFoundException('Satıcıya ait sipariş bulunamadı.');
    }

    const dtos = this.mapper.mapArray(orders, Orders, OrderResponseDto);
    return dtos.map(dto => new OrderResponseDtoWrapper(dto, 'Sipariş başarıyla getirildi', true));
  }
  async getAllOrders(): Promise<OrderResponseDtoWrapper[]> {
  const orders = await this.orderRepository.find({
    relations: [
      'orderDetails',
      'orderDetails.sellerProduct',
      'orderDetails.sellerProduct.product',
      'customer',
      'customer.user',
      'seller',
      'seller.user',
    ],
    order: { createdAt: 'DESC' },
  });

  if (!orders.length) {
    throw new NotFoundException('Hiç sipariş bulunamadı.');
  }

  const dtos = this.mapper.mapArray(orders, Orders, OrderResponseDto);
  return dtos.map(dto => new OrderResponseDtoWrapper(dto, 'Sipariş başarıyla getirildi', true));
}

}
