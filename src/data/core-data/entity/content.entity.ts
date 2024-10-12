import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'content' })
export class ContentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  data: string;

  @ManyToOne(() => UserEntity)
  creator: UserEntity;

  @Column()
  creatorId: number;

  @CreateDateColumn()
  createdAt: Date;
}
