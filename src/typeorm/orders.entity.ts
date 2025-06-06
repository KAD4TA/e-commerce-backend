import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "src/base/base.entity";
import { OrderDetails } from "./order.details.entity";
import { Sellers } from "./sellers.entity";
import { Cart } from "./cart.entity";
import { v4 as uuidv4 } from "uuid";
import { Customers } from "./customers.entity";
@Entity()
export class Orders extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderNumber: string;

  @ManyToOne(() => Sellers, (seller) => seller.orders, { eager: true })
  seller: Sellers;

  @ManyToOne(() => Customers, (customer) => customer.orders, { eager: true })
  customer: Customers;

  // Cart ile ilişkiyi ManyToOne olarak değiştiriyoruz.
  @ManyToOne(() => Cart, (cart) => cart.orders, { eager: true })
  @JoinColumn()
  cart: Cart;

  @OneToMany(() => OrderDetails, (detail) => detail.order, { cascade: true })
  orderDetails: OrderDetails[];

  @Column({ type: "float", default: 0, nullable: false })
  totalPrice: number;

  @Column({ type: "float", default: 0, nullable: false })
  shipPrice: number;

  @Column({ type: "enum", enum: ["Pending", "Shipped", "Delivered"], default: "Pending" })
  status: "Pending" | "Shipped" | "Delivered";

  @BeforeInsert()
  generateOrderNumber() {
    this.orderNumber = uuidv4();
  }
}