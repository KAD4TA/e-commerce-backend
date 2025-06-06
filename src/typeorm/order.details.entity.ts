

import { BaseEntity } from "src/base/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Orders } from "./orders.entity";
import { Customers } from "./customers.entity";
import { SellerProduct } from "./seller.product.entity";
import { Products } from "./products.entity";


@Entity()
export class OrderDetails extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Orders, (order) => order.orderDetails, { onDelete: "CASCADE" })
  order: Orders;

  @ManyToOne(() => SellerProduct, { eager: true })
  sellerProduct: SellerProduct;

  @ManyToOne(() => Products, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Products;

  @ManyToOne(() => Customers, { eager: true })
  customer: Customers;

  @Column()
  quantity: number;

  @Column({ type: "float"})
  unitPrice: number;

  @Column({ type: "float"})
  totalPrice: number;
}