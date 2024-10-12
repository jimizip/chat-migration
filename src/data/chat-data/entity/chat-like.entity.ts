import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatEntity, ChatOldEntity } from './chat.entity';

@Entity({ name: 'chat_like' })
export class ChatLikeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  chatId: number;

  @ManyToOne(() => ChatEntity, (c) => c.likes)
  chat: ChatEntity;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity({ name: 'chat_like' })
export class ChatLikeOldEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  chatId: number;

  @ManyToOne(() => ChatOldEntity, (c) => c.likes)
  chat: ChatOldEntity;

  @CreateDateColumn()
  createdAt: Date;
}
