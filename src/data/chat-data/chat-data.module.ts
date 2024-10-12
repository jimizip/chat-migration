import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ChatLikeEntity } from '../chat-data/entity/chat-like.entity';
import { ChatEntity, ChatOldEntity } from '../chat-data/entity/chat.entity';

export const CHAT_DATA_SOURCE_NAME = 'chat_data_source_name';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: CHAT_DATA_SOURCE_NAME,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        return {
          type: 'postgres',
          database: process.env.CHAT_DB_NAME,
          host: process.env.CHAT_DB_HOST,
          username: process.env.CHAT_DB_USER,
          password: process.env.CHAT_DB_PW,
          port: parseInt(process.env.CHAT_DB_PORT, 10),
          synchronize: true,
          logging: false,
          namingStrategy: new SnakeNamingStrategy(),
          entities: [ChatEntity, ChatLikeEntity],
        };
      },
    }),
  ],
})
export class ChatDataModule {}
