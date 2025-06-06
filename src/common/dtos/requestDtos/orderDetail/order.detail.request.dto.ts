import { AutoMap } from "@automapper/classes";

export class OrderDetailRequestDto {
    @AutoMap()
    quantity: number;
    @AutoMap()
    unitPrice: number;
    @AutoMap()
    totalPrice: number;
    @AutoMap()
    sellerProductId: number;
    @AutoMap()
    orderId: number;
    @AutoMap()
    customerId: number;
  }