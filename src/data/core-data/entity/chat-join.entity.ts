import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ChatRoomEntity } from './chat-room.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'chat_join' })
@Unique('chat_join_unique', ['userId', 'roomId'])
export class ChatJoinEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  roomId: number;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => ChatRoomEntity, (cr) => cr.chatJoins)
  room: ChatRoomEntity;

  @CreateDateColumn()
  createdAt: Date;
}
