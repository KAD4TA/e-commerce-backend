import { BaseEntity } from "src/base/base.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Products } from "./products.entity";
import { Sellers } from "./sellers.entity";
import { CartItem } from "./cartItem.entity";
import { Reviews } from "./reviews.entity";
import { Favorites } from "./favorites.entity";

@Entity()
export class SellerProduct extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sellers, (seller) => seller.sellerProducts, { onDelete: "CASCADE" })
  seller: Sellers;

  @ManyToOne(() => Products, (product) => product.sellerProducts, { onDelete: "CASCADE" })
  product: Products;

  @Column({ type: "float", default:0, nullable: false})
  price: number;

  @Column({ type: "float", default: 0 })
  avgProductRate: number;

  @OneToMany(() => CartItem, (cartItem) => cartItem.sellerProduct)
  cartItems: CartItem[];

  @OneToMany(() => Reviews, (review) => review.sellerProduct)
  reviews: Reviews[];

  @OneToMany(() => Favorites, (favorite) => favorite.sellerProduct)
  favorites: Favorites[];

  @Column({ type: "float", nullable: true })
  discountPrice?: number;

  @Column()
  size:string;

  @Column()
  productImageUrl: string;

  @Column()
  stock: number;
}