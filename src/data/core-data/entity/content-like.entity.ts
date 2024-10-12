import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ContentEntity } from './content.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'content_like' })
@Unique('content_like_unique', ['userId', 'contentId'])
export class ContentLikeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  contentId: number;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => ContentEntity)
  post: ContentEntity;

  @CreateDateColumn()
  createdAt: Date;
}
