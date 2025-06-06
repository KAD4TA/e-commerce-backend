
import { BaseEntity } from "src/base/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Sellers } from "./sellers.entity";
import { Customers } from "./customers.entity";
import { SellerProduct } from "./seller.product.entity";

@Entity()

export class Reviews extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customers, (customer) => customer.reviews, { onDelete: 'CASCADE' })
  customer: Customers;

  @ManyToOne(() => SellerProduct, (sellerProduct) => sellerProduct.reviews, { eager: false })
  @JoinColumn({ name: 'seller_product_id' })
  sellerProduct: SellerProduct;

  @ManyToOne(() => Sellers, (seller) => seller.reviews, { onDelete: "CASCADE" })
  seller: Sellers;

  @Column({ type: "int", width: 1 })
  productRating: number;

  @Column({ type: "text" })
  productReviewText: string;

  @Column({ type: "text", nullable: true })
  productReviewImage: string;

  @Column({ type: "int", width: 1, nullable: true })
  sellerRating: number;

  @Column({ type: "text", nullable: true })
  sellerReviewText: string;
}