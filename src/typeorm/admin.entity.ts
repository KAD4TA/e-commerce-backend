// src/typeorm/admins.entity.ts
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./users.entity";
import { LevelCodes } from "./level-codes.entity";

@Entity()
export class Admins {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "int", default: 1 }) // 1: Normal Admin, 2: Super Admin
  adminLevel: number;

  @Column({ type: "timestamp", nullable: true })
  lastLogin?: Date;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ type: "boolean", default: false })
  isLocked: boolean;

  @OneToOne(() => Users, (user) => user.admin, { onDelete: "CASCADE" })
  user: Users;

  @OneToOne(() => LevelCodes, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn()
  levelCode: LevelCodes | null;
}