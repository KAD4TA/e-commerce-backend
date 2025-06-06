// src/typeorm/level-codes.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class LevelCodes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 36 }) // UUID format (e.g., "550e8400-e29b-41d4-a716-446655440000")
  code: string;

  @Column({ type: "int" }) // 1: Normal Admin, 2: Super Admin
  level: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ nullable: true })
  assignedUserId?: number; // Assigned admin user ID
}