import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CartItem, SellerProduct } from "src/typeorm";

export interface PriceDetails {
  subtotal: number;
  shipPrice: number;
  totalPrice: number;
}

@Injectable()
export class PriceCalculationService {
  private readonly BASE_SHIPPING_FEE = 45;
  private readonly FREE_SHIPPING_THRESHOLD = 200;

  constructor(
    @InjectRepository(SellerProduct)
    private readonly sellerProductRepository: Repository<SellerProduct>,
  ) {}

  async calculatePrices(cartItems: CartItem[]): Promise<PriceDetails> {
    if (!cartItems || cartItems.length === 0) {
      throw new NotFoundException('Sepet öğeleri boş veya geçersiz');
    }

    
    const enrichedItems = await Promise.all(
      cartItems.map(async (item) => {
        if (!item.sellerProduct || !item.sellerProduct.id) {
          throw new NotFoundException(`Sepet öğesi ${item.id} için ürün bilgisi eksik`);
        }

        
        if (
          item.sellerProduct.discountPrice === undefined ||
          item.sellerProduct.price === undefined
        ) {
          const product = await this.sellerProductRepository.findOne({
            where: { id: item.sellerProduct.id },
            relations: ['product'], // varsa
          });

          if (!product) {
            throw new NotFoundException(`Ürün (ID: ${item.sellerProduct.id}) bulunamadı`);
          }

          item.sellerProduct = product;
        }

        return item;
      }),
    );

    // Subtotal
    const subtotal = enrichedItems.reduce((sum, item) => {
      const { price, discountPrice } = item.sellerProduct!;
      const unitPrice =
        discountPrice !== null && discountPrice !== undefined
          ? discountPrice
          : price;

      return sum + unitPrice * item.quantity;
    }, 0);

    // Count shipprice
    const shipPrice = subtotal >= this.FREE_SHIPPING_THRESHOLD ? 0 : this.BASE_SHIPPING_FEE;

    const totalPrice = subtotal + shipPrice;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      shipPrice: Number(shipPrice.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2)),
    };
  }
}





