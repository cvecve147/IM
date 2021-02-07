import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user.interface';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true, default: '' })
  phoneNumber: string;

  @Column({ nullable: true, default: '' })
  address: string;

  @Column({ nullable: true, default: '' })
  level: string;

  @Column({ nullable: true, default: '' })
  industry: string;

  @Column({ nullable: true, default: '' })
  position: string;

  @Column({ nullable: true, default: false })
  management: boolean;

  @Column({
    nullable: false,
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  power: UserRole;
}
