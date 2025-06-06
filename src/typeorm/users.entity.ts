import { Column, Entity, JoinColumn,  OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Customers } from "./customers.entity";
import { Sellers } from "./sellers.entity";
import { BaseEntity } from "src/base/base.entity";
import { Role } from "src/common/enums/role.enum";
import { Admins } from "./admin.entity";


@Entity()
export class Users extends BaseEntity {

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    name: string;

    @Column()
    lastName: string;

    @Column({ nullable: false, default: 'default-user-image.png' })
    userImage: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    telephoneNumber?: string;

    @Column({ type: "enum", enum: Role })
    role: Role;

    @Column({ nullable: true }) 
    refreshToken?: string;

    @OneToOne(() => Customers, (customer) => customer.user, { cascade: true, nullable: true, onDelete: "CASCADE" })
    @JoinColumn()
    customer: Customers | null;

    @OneToOne(() => Sellers, (seller) => seller.user, { cascade: true, nullable: true, onDelete: "CASCADE" })
    @JoinColumn()
    seller: Sellers | null;

    @OneToOne(() => Admins, (admin) => admin.user, { cascade: true, nullable: true, onDelete: "CASCADE" })
    @JoinColumn()
    admin: Admins | null;
    
}