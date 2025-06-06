import { BaseEntity } from "src/base/base.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Customers } from "./customers.entity";
import { CartItem } from "./cartItem.entity";
import { Orders } from "./orders.entity";

@Entity()
export class Cart extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customers, (customer) => customer.carts, { onDelete: "CASCADE" })
  customer: Customers;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true, eager: true })
  cartItems: CartItem[];

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  shipPrice: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @OneToMany(() => Orders, (order) => order.cart)
  orders: Orders[];
  
  @Column({ default: true })
  isActive: boolean; 
}