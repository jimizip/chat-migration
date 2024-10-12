import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatLikeEntity, ChatLikeOldEntity } from './chat-like.entity';

@Entity({ name: 'chat' })
export class ChatEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: number;

  @Column()
  roomId: number;

  @OneToMany(() => ChatLikeEntity, (cl) => cl.chat)
  likes: Array<ChatLikeEntity>;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity({ name: 'chat' })
export class ChatOldEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  senderId: number;

  @Column()
  roomId: number;

  @OneToMany(() => ChatLikeOldEntity, (cl) => cl.chat)
  likes: Array<ChatLikeOldEntity>;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
