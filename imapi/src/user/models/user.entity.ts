import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user.interface';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  level: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  position: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  power: UserRole;
}
