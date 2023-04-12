import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Card {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  card_number: string;

  @Column()
  card_expiry: number;

  @Column()
  card_cvc: number;

  @Column()
  card_name: string;
}
