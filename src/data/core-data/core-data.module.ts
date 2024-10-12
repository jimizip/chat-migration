import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ChatJoinEntity } from './entity/chat-join.entity';
import {
  ChatLikeEntity,
  ChatLikeOldEntity,
} from '../chat-data/entity/chat-like.entity';
import { ChatRoomEntity } from './entity/chat-room.entity';
import { ContentLikeEntity } from './entity/content-like.entity';
import { ContentEntity } from './entity/content.entity';
import { ChatEntity, ChatOldEntity } from '../chat-data/entity/chat.entity';
import { UserEntity } from './entity/user.entity';

export const CORE_DATA_SOURCE_NAME = 'core_data_source_name';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: CORE_DATA_SOURCE_NAME,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        return {
          type: 'postgres',
          database: process.env.DB_NAME,
          host: process.env.DB_HOST,
          username: process.env.DB_USER,
          password: process.env.DB_PW,
          port: parseInt(process.env.DB_PORT, 10),
          synchronize: false,
          logging: false,
          namingStrategy: new SnakeNamingStrategy(),
          ssl: { rejectUnauthorized: false },
          entities: [
            UserEntity,
            ChatJoinEntity,
            ChatRoomEntity,
            ChatOldEntity,
            ChatLikeOldEntity,
            ContentEntity,
            ContentLikeEntity,
          ],
        };
      },
    }),
  ],
})
export class CoreDataModule {}
