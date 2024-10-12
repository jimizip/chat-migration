import { ChatEntity } from 'src/data/chat-data/entity/chat.entity';
import { UserEntity } from 'src/data/core-data/entity/user.entity';

export type ChatRoomModel = {
  id: number;
  name: string;
  users: Array<UserEntity>;
  noticeChat: ChatEntity;
  createdAt: Date;
};

export type ChatModel = {
  id: number;
  content: string;
  sender: UserEntity;
  senderId: number;
  roomId: number;
  likeCount: number;
  liked: boolean;
  createdAt: Date;
};
