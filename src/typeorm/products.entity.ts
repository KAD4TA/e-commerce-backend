
import { BaseEntity } from "src/base/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany,PrimaryGeneratedColumn } from "typeorm";
import { Categories } from "./categories.entity";
import { SellerProduct } from "./seller.product.entity";
import { Favorites } from "./favorites.entity";


@Entity()
export class Products extends BaseEntity {


  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Categories, (category) => category.products, { eager: true })
  @JoinColumn()
  category: Categories;

  @Column()
  description: string;

  @Column({ type: "float" })
  basePrice: number;

  @OneToMany(()=>Favorites,(favorite)=>favorite.product)
  favorites:Favorites[]

  @Column()
  productImageUrl:string;

  @OneToMany(() => SellerProduct, (sellerProduct) => sellerProduct.product)
  sellerProducts: SellerProduct[];

  
  
}