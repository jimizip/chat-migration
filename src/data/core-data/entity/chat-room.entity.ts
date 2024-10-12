import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ChatJoinEntity } from './chat-join.entity';

@Entity({ name: 'chat_room' })
@Unique('chat_room_unique', ['name'])
export class ChatRoomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => ChatJoinEntity, (cj) => cj.room)
  chatJoins: Array<ChatJoinEntity>;

  @Column({ nullable: true })
  noticeChatId: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
