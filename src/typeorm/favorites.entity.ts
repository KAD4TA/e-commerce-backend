
import { BaseEntity } from "src/base/base.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Customers } from "./customers.entity";
import { SellerProduct } from "./seller.product.entity";
import { Products } from "./products.entity";


@Entity()
export class Favorites extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customers, { onDelete: "CASCADE" })
  customer: Customers;

  @ManyToOne(()=>Products,(product)=>product.favorites, { nullable: false })
  product:Products;

  @ManyToOne(() => SellerProduct,(sellerProduct)=>sellerProduct.favorites, { onDelete: "CASCADE" })
  sellerProduct: SellerProduct;

  
 
}