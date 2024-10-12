import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatJoinEntity } from 'src/data/core-data/entity/chat-join.entity';
import { ChatRoomEntity } from 'src/data/core-data/entity/chat-room.entity';
import {
  ChatEntity,
  ChatOldEntity,
} from 'src/data/chat-data/entity/chat.entity';
import { UserEntity } from 'src/data/core-data/entity/user.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import {
  ChatLikeEntity,
  ChatLikeOldEntity,
} from 'src/data/chat-data/entity/chat-like.entity';
import { CORE_DATA_SOURCE_NAME } from 'src/data/core-data/core-data.module';
import { CHAT_DATA_SOURCE_NAME } from 'src/data/chat-data/chat-data.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        ChatOldEntity,
        ChatRoomEntity,
        ChatJoinEntity,
        UserEntity,
        ChatLikeOldEntity,
      ],
      CORE_DATA_SOURCE_NAME,
    ),
    TypeOrmModule.forFeature(
      [ChatEntity, ChatLikeEntity],
      CHAT_DATA_SOURCE_NAME,
    ),
  ],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
