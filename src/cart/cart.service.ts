
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { CartRequestDto } from 'src/common/dtos/requestDtos/cart/cart.request.dto';
import {
  CartResponseDto,
  CartResponseDtoWrapper,
} from 'src/common/dtos/responseDtos/cart/cart.response.dto';
import { Cart, CartItem, Customers, SellerProduct } from 'src/typeorm';
import { PriceCalculationService } from 'src/price-calculation/price-calculation.service';
import { OrderResponseDtoWrapper } from 'src/common/dtos/responseDtos/order/order.response.dto';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Customers)
    private readonly customerRepository: Repository<Customers>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(SellerProduct)
    private readonly sellerProductRepository: Repository<SellerProduct>,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly priceCalculationService: PriceCalculationService,
    private readonly orderService: OrderService,
  ) {}

  async createCart(
    cartRequestDto: CartRequestDto,
    customerId: number,
  ): Promise<CartResponseDtoWrapper> {
    return await this.cartRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        const customer = await transactionalEntityManager.findOne(Customers, {
          where: { id: customerId },
          relations: ['user'],
        });

        if (!customer) {
          throw new NotFoundException(
            `Customer with ID ${customerId} not found`,
          );
        }

        const cartEntity = this.mapper.map(
          cartRequestDto,
          CartRequestDto,
          Cart,
        );
        cartEntity.customer = customer;
        cartEntity.cartItems = [];
        cartEntity.isActive = true;

        for (const cartItemDto of cartRequestDto.cartItems) {
          const sellerProduct = await transactionalEntityManager.findOne(
            SellerProduct,
            {
              where: { id: cartItemDto.sellerProductId },
              relations: ['seller', 'product'],
            },
          );

          if (!sellerProduct) {
            throw new NotFoundException(
              `SellerProduct with ID ${cartItemDto.sellerProductId} not found`,
            );
          }
          if (!sellerProduct.seller) {
            throw new NotFoundException(
              `Seller not found for product ID ${cartItemDto.sellerProductId}`,
            );
          }
          if (!sellerProduct.product) {
            throw new NotFoundException(
              `Product details not found for seller product ID ${cartItemDto.sellerProductId}`,
            );
          }
          if (sellerProduct.stock < cartItemDto.quantity) {
            throw new NotFoundException(
              `Insufficient stock for product ID ${sellerProduct.id}`,
            );
          }

          const cartItem = new CartItem();
          cartItem.sellerProduct = sellerProduct;
          cartItem.quantity = cartItemDto.quantity;
          cartItem.cart = cartEntity;
          cartEntity.cartItems.push(cartItem);
        }

        const prices = await this.priceCalculationService.calculatePrices(
          cartEntity.cartItems,
        );
        cartEntity.totalPrice = prices.totalPrice;
        cartEntity.shipPrice = prices.shipPrice;

        const savedCart = await transactionalEntityManager.save(
          Cart,
          cartEntity,
        );

        const cart = await transactionalEntityManager.findOne(Cart, {
          where: { id: savedCart.id },
          relations: [
            'customer',
            'customer.user',
            'cartItems',
            'cartItems.sellerProduct',
            'cartItems.sellerProduct.seller',
            'cartItems.sellerProduct.product',
          ],
        });

        if (!cart) {
          throw new NotFoundException(`Cart with ID ${savedCart.id} not found`);
        }

        const cartResponse = this.mapper.map(cart, Cart, CartResponseDto);

        return {
          data: cartResponse,
          success: true,
          message: 'Successfully added to cart',
        };
      },
    );
  }

  async confirmCart(
    customerId: number,
  ): Promise<{ message: string; orders: OrderResponseDtoWrapper[] }> {
    return await this.cartRepository.manager.transaction(
      async (manager: EntityManager) => {
        const cart = await manager.findOne(Cart, {
          where: { customer: { id: customerId }, isActive: true },
          relations: [
            'cartItems',
            'cartItems.sellerProduct',
            'cartItems.sellerProduct.seller',
            'cartItems.sellerProduct.product',
            'customer',
          ],
        });

        if (!cart) {
          throw new NotFoundException(
            `Müşteri için aktif sepet bulunamadı (ID: ${customerId})`,
          );
        }

        if (!cart.cartItems?.length) {
          throw new NotFoundException(`Sepet boş (ID: ${cart.id})`);
        }

        const customer = await manager.findOne(Customers, {
          where: { id: customerId },
          relations: ['user'],
        });

        if (!customer) {
          throw new NotFoundException(`Müşteri bulunamadı (ID: ${customerId})`);
        }

        for (const item of cart.cartItems) {
          if (!item.sellerProduct) {
            throw new BadRequestException(
              `Sepet öğesi için ürün bilgisi eksik (CartItem ID: ${item.id})`,
            );
          }

          const sp = await manager.findOne(SellerProduct, {
            where: { id: item.sellerProduct.id },
            relations: ['seller', 'product'],
          });

          if (!sp) {
            throw new NotFoundException(
              `SellerProduct bulunamadı (ID: ${item.sellerProduct.id})`,
            );
          }
          if (sp.stock < item.quantity) {
            throw new BadRequestException(
              `Stok yetersiz (SellerProduct ID: ${sp.id})`,
            );
          }
        }

        const itemsBySeller: Record<number, CartItem[]> = {};
        for (const item of cart.cartItems) {
          const sellerId = item.sellerProduct.seller.id;
          if (!itemsBySeller[sellerId]) {
            itemsBySeller[sellerId] = [];
          }
          itemsBySeller[sellerId].push(item);
        }

        const orders: OrderResponseDtoWrapper[] = [];
        const failedOrders: string[] = [];

        for (const sellerIdStr in itemsBySeller) {
          const sellerId = parseInt(sellerIdStr, 10);
          const sellerItems = itemsBySeller[sellerId];
          const sellerCart = { ...cart, cartItems: sellerItems, customer };

          try {
            const orderResponse = await this.orderService.createOrder(
              customerId,
              sellerCart,
              manager,
            );
            orders.push(orderResponse);
          } catch (error) {
            const errMsg =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
            failedOrders.push(
              `Satıcı ID: ${sellerId} için sipariş oluşturulamadı: ${errMsg}`,
            );
          }
        }

        await manager.update(Cart, { id: cart.id }, { isActive: false });

        const message =
          failedOrders.length > 0
            ? `Bazı siparişler oluşturulamadı: ${failedOrders.join('; ')}`
            : 'Sepet onaylandı ve siparişler oluşturuldu';

        return { message, orders };
      },
    );
  }

  async updateCart(
  cartId: number,
  cartRequestDto: CartRequestDto,
): Promise<CartResponseDtoWrapper> {
  return await this.cartRepository.manager.transaction(
    async (transactionalEntityManager: EntityManager) => {
      const cart = await transactionalEntityManager.findOne(Cart, {
        where: { id: cartId, isActive: true },
        relations: [
          'cartItems',
          'cartItems.sellerProduct',
          'cartItems.sellerProduct.product',
          'customer',
          'customer.user',
        ],
      });

      if (!cart) {
        throw new NotFoundException(`Aktif sepet (ID: ${cartId}) bulunamadı`);
      }

      if (!cartRequestDto.cartItems || cartRequestDto.cartItems.length === 0) {
        throw new NotFoundException('the basket is not empty');
      }

      const existingItems: CartItem[] = cart.cartItems || [];
      const existingItemsMap = new Map(
        existingItems.map((item) => [item.sellerProduct?.id, item]),
      );

      const newItems: CartItem[] = [];

      for (const cartItemRequest of cartRequestDto.cartItems) {
        const sellerProduct = await transactionalEntityManager.findOne(SellerProduct, {
          where: { id: cartItemRequest.sellerProductId },
          relations: ['seller', 'product'],
        });

        if (!sellerProduct) {
          throw new NotFoundException(
            `Ürün (ID: ${cartItemRequest.sellerProductId}) bulunamadı`,
          );
        }
        if (sellerProduct.stock < cartItemRequest.quantity) {
          throw new NotFoundException(
            `Ürün (ID: ${sellerProduct.id}) için yetersiz stok: Mevcut ${sellerProduct.stock}, Talep edilen ${cartItemRequest.quantity}`,
          );
        }

        const existingItem = existingItemsMap.get(sellerProduct.id);
        if (existingItem) {
          existingItem.quantity = cartItemRequest.quantity;
          newItems.push(existingItem);
        } else {
          const cartItem = transactionalEntityManager.create(CartItem, {
            sellerProduct,
            quantity: cartItemRequest.quantity,
            cart,
          });
          newItems.push(cartItem);
        }
      }

      const itemsToRemove = existingItems.filter(
        (item) =>
          !newItems.some(
            (newItem) => newItem.sellerProduct?.id === item.sellerProduct?.id,
          ),
      );

      if (itemsToRemove.length > 0) {
        await transactionalEntityManager.remove(CartItem, itemsToRemove);
      }

      cart.cartItems = newItems;

      const prices = await this.priceCalculationService.calculatePrices(
        cart.cartItems,
      );
      cart.totalPrice = prices.totalPrice;
      cart.shipPrice = prices.shipPrice;

      const updatedCart = await transactionalEntityManager.save(Cart, cart);

      const loadedCart = await transactionalEntityManager.findOne(Cart, {
        where: { id: updatedCart.id },
        relations: [
          'customer',
          'customer.user',
          'cartItems',
          'cartItems.sellerProduct',
          'cartItems.sellerProduct.product',
        ],
      });

      if (!loadedCart) {
        throw new NotFoundException(
          `Güncellenmiş sepet (ID: ${updatedCart.id}) bulunamadı`,
        );
      }

      const cartResponse = this.mapper.map(loadedCart, Cart, CartResponseDto);

      return {
        data: cartResponse,
        success: true,
        message: 'Sepet başarıyla güncellendi',
      };
    },
  );
}
  async getUserCart(userCustomer: number): Promise<CartResponseDtoWrapper> {
    const cart = await this.cartRepository.findOne({
      where: { customer: { id: userCustomer }, isActive: true },
      relations: [
        'customer',
        'customer.user',
        'cartItems',
        'cartItems.sellerProduct',
        'cartItems.sellerProduct.product',
      ],
    });

    if (!cart) {
      throw new NotFoundException(
        `Müşteri (ID: ${userCustomer}) için aktif sepet bulunamadı`,
      );
    }

    if (cart.customer.id !== userCustomer) {
      throw new ForbiddenException('Bu sepete erişim yetkiniz yok');
    }

    
    const priceDetails = await this.priceCalculationService.calculatePrices(
      cart.cartItems,
    );

  
    const cartResponse = this.mapper.map(cart, Cart, CartResponseDto);


    cartResponse.subtotal = priceDetails.subtotal;
    cartResponse.shipPrice = priceDetails.shipPrice;
    cartResponse.totalPrice = priceDetails.totalPrice;

    return {
      data: cartResponse,
      success: true,
      message: 'Sepet başarıyla alındı',
    };
  }

  async removeCartItem(
    user: number,
    cartItemId: number,
  ): Promise<{ success: boolean; message: string }> {
    return await this.cartRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        const cartItem = await transactionalEntityManager.findOne(CartItem, {
          where: { id: cartItemId },
          relations: [
            'cart',
            'cart.cartItems',
            'cart.customer',
            'cart.customer.user',
            'sellerProduct',
          ],
        });

        if (!cartItem) {
          throw new NotFoundException(
            `Sepet öğesi (ID: ${cartItemId}) bulunamadı`,
          );
        }

        const cart = cartItem.cart;

        if (!cart || cart.customer.id !== user || !cart.isActive) {
          throw new ForbiddenException(
            'Bu sepet öğesini silme yetkiniz yok veya sepet aktif değil',
          );
        }

        cart.cartItems = cart.cartItems.filter(
          (item) => item.id !== cartItem.id,
        );

        const prices = await this.priceCalculationService.calculatePrices(
          cart.cartItems,
        );
        cart.totalPrice = prices.totalPrice;
        cart.shipPrice = prices.shipPrice;

        await transactionalEntityManager.save(Cart, cart);
        await transactionalEntityManager.remove(CartItem, cartItem);

        return { success: true, message: 'Cart item removed successfully' };
      },
    );
  }
}
