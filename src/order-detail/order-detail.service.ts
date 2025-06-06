import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderDetails } from "src/typeorm/order.details.entity";
import { Mapper } from "@automapper/core";
import { InjectMapper } from "@automapper/nestjs";
import { OrderDetailResponseDto } from "src/common/dtos/responseDtos/orderDetail/order.detail.response.dto";


@Injectable()
export class OrderDetailService {
  constructor(
    @InjectRepository(OrderDetails)
    private readonly orderDetailRepository: Repository<OrderDetails>,
    @InjectMapper() private readonly mapper: Mapper
  ) {}

  async getOrderDetailsForCustomer(customer: number, orderId: number): Promise<OrderDetailResponseDto[]> {
    const orderDetails = await this.orderDetailRepository.find({
      where: { order: { id: orderId, customer: { id: customer } } },
      relations: ["order", "order.seller", "sellerProduct", "sellerProduct.product"],
    });

    if (!orderDetails.length) {
      throw new NotFoundException("Sipariş detayları bulunamadı");
    }

    return this.mapper.mapArray(orderDetails, OrderDetails, OrderDetailResponseDto);
  }

  async getOrderDetailsForSeller(seller: number, orderId: number): Promise<OrderDetailResponseDto[]> {
    const orderDetails = await this.orderDetailRepository.find({
      where: { order: { id: orderId, seller: { id: seller} } },
      relations: ["order", "order.seller", "sellerProduct", "sellerProduct.product"],
    });

    if (!orderDetails.length) {
      throw new NotFoundException("Sipariş detayları bulunamadı");
    }

    return this.mapper.mapArray(orderDetails, OrderDetails, OrderDetailResponseDto);
  }
}
