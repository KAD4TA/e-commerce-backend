import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "./cart.entity";
import { SellerProduct } from "./seller.product.entity";

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.cartItems, { onDelete: "CASCADE" })
  cart: Cart;

  @ManyToOne(() => SellerProduct, (sellerProduct) => sellerProduct.cartItems, { onDelete: "CASCADE", eager: true })
  sellerProduct: SellerProduct;

  @Column()
  quantity: number;
}