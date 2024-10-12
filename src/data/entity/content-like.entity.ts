import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ContentEntity } from '../core-data/entity/content.entity';
import { UserEntity } from '../core-data/entity/user.entity';
// import { ContentEntity } from './content.entity';
// import { UserEntity } from './user.entity';

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
  content: ContentEntity;

  @CreateDateColumn()
  createdAt: Date;
}
