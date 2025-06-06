import { Controller, Body, Post, Get, Put, Delete, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import { CartService } from "./cart.service";
import { GetCustomerUser } from "src/common/decorators/get.customer.user.decorator";

import { CustomerGuard } from "src/guards/role.customer.guard";
import { JwtAuthGuard } from "src/guards/jwt.auth.guard";
import { CartResponseDtoWrapper } from "src/common/dtos/responseDtos/cart/cart.response.dto";
import { CartRequestDto } from "src/common/dtos/requestDtos/cart/cart.request.dto";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post("/add")
  @UseGuards(JwtAuthGuard, CustomerGuard)
  async addToCart(
    @Body() cartRequestDto: CartRequestDto,
    @GetCustomerUser() customerId: number
  ): Promise<CartResponseDtoWrapper> {
    return this.cartService.createCart(cartRequestDto, customerId);
  }

  @Get("/customer")
  @UseGuards(JwtAuthGuard, CustomerGuard)
  async getUserCart(@GetCustomerUser() userCustomer: number): Promise<CartResponseDtoWrapper> {
    return this.cartService.getUserCart(userCustomer);
  }

  @Put(":cartId")
  @UseGuards(JwtAuthGuard, CustomerGuard)
  async updateCart(
    @Param("cartId", ParseIntPipe) cartId: number,
    @Body() cartRequestDto: CartRequestDto
  ): Promise<CartResponseDtoWrapper> {
    return this.cartService.updateCart(cartId, cartRequestDto);
  }
  @Post('confirm')
  @UseGuards(JwtAuthGuard,CustomerGuard)
  async confirmCart(@GetCustomerUser() customerId:number) {
    
    return this.cartService.confirmCart(customerId);
  }

  @Delete(":cartId")
  @UseGuards(JwtAuthGuard, CustomerGuard)
  async removeCartItem(
    @GetCustomerUser() user: number,
    @Param("cartId", ParseIntPipe) cartId: number
  ): Promise<{ success: boolean; message: string }> {
    return this.cartService.removeCartItem(user, cartId);
  }
}