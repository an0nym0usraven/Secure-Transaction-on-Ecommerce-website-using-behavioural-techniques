import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class Product {
  @CreateDateColumn()
  created_on: Date;

  @PrimaryGeneratedColumn("uuid")
  product_id: string;

  @Column()
  title: string;

  @Column()
  price: number;

  @Column()
  description: string;

  @Column()
  metadata: string;

  @Column()
  category: string;

  @Column()
  image: string;
}
