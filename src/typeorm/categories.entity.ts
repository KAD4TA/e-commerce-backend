
import { Products } from "./products.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "src/base/base.entity";
import { CategoryEnum, SubCategoryEnum } from "src/common/enums/category.enum";

@Entity()
export class Categories extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: CategoryEnum, default: CategoryEnum.ELECTRONICS })
  categoryId: CategoryEnum; 

  @Column({ type: "enum", enum: SubCategoryEnum, default: SubCategoryEnum.MOBILE_PHONES })
  subCategoryId: SubCategoryEnum; 

  @OneToMany(() => Products, (product) => product.category)
  products: Products[]; 
}
