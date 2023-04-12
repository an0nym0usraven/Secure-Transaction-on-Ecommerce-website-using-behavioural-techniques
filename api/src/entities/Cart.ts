import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Cart {
  @CreateDateColumn()
  created_on: Date;

  @PrimaryGeneratedColumn("uuid")
  cart_item_id: string;

  @Column()
  product_id: string;

  @Column()
  qty: number;

  @Column()
  creator: string;

  @ManyToOne(() => User, (user) => user.cart)
  @JoinColumn({ name: "creator", referencedColumnName: "user_id" })
  user: User;
}
