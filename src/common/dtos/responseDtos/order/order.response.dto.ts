import { BaseResponse } from "src/base/base.response";
import { CustomerResponseDto } from "../customer/customer.response.dto";

export class OrderResponseDto {
  id: number;
  orderNumber: string;
  customer: CustomerResponseDto;
  totalPrice: number;
  shipPrice: number;
  status: "Pending" | "Shipped" | "Delivered";
}

export class OrderResponseDtoWrapper extends BaseResponse<OrderResponseDto> {
  constructor(data: OrderResponseDto, message: string, success: boolean) {
    super(data, message, success);
  }
}