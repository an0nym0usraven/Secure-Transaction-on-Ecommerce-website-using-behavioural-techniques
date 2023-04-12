import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Cart } from "./Cart";
import { Card } from "./Card";
import { Fingerprint } from "./Fingerprint";

@Entity()
export class User {
  @CreateDateColumn()
  created_on: Date;

  @PrimaryGeneratedColumn("uuid")
  user_id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  password: string;

  @OneToMany(() => Cart, (cart) => cart.user, {
    eager: true,
    cascade: true,
  })
  cart: Cart[];

  @OneToOne(() => Card)
  @JoinColumn()
  card: Card;

  @OneToOne(() => Fingerprint)
  @JoinColumn()
  fingerprint: Fingerprint;
}
