import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Fingerprint {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  ip: string;

  @Column()
  fingerprint: string;
}
