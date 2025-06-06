
import { BaseEntity } from "src/base/base.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./users.entity";
import { OrderDetails } from "./order.details.entity";
import { Favorites } from "./favorites.entity";
import { Orders } from "./orders.entity";
import { Cart } from "./cart.entity";
import { Reviews } from "./reviews.entity";


@Entity()
export class Customers extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  city: string;

  @OneToOne(() => Users, (user) => user.customer, { onDelete: "CASCADE" })
  @JoinColumn()
  user: Users;


  @OneToMany(() => Orders, (order) => order.customer, { onDelete: "CASCADE" })
  orders: Orders[];

  @OneToMany(() => OrderDetails, (detail) => detail.customer)
  orderDetails: OrderDetails[];

  @OneToMany(()=>Reviews,(review)=>review.customer)
  reviews:Reviews[]

  @OneToMany(() => Cart, (cart) => cart.customer)
  carts: Cart[];

  @OneToMany(() => Favorites, (favorite) => favorite.customer)
  favorites: Favorites[];
  
}