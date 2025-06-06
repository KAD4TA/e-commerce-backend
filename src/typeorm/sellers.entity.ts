import { BaseEntity } from "src/base/base.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Reviews } from "./reviews.entity";
import { Users } from "./users.entity";
import { Orders } from "./orders.entity";
import { SellerProduct } from "./seller.product.entity";


@Entity()
export class Sellers extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  storeName: string;

  @Column()
  storeAddress: string;

  @Column({ unique: true })
  taxNumber: string;

  @OneToOne(() => Users, (user) => user.seller, { onDelete: "CASCADE" , eager: true})
  @JoinColumn()
  user: Users;

  @OneToMany(() => SellerProduct, (sellerProduct) => sellerProduct.seller, { cascade: true })
  sellerProducts: SellerProduct[];

  @OneToMany(() => Orders, (order) => order.seller, { cascade: true })
  orders: Orders[];
  
 

  @OneToMany(() => Reviews, (review) => review.seller)
  reviews: Reviews[];

  @Column({ type: "float", default: 0 })
  averageRating: number;
}