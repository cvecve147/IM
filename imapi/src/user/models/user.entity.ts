import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, select: false })
  password: string;

  @Column({ nullable: true })
  level: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: false })
  power: string;
}
