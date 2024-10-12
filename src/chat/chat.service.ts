import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CORE_DATA_SOURCE_NAME } from 'src/data/core-data/core-data.module';
import { ChatJoinEntity } from 'src/data/core-data/entity/chat-join.entity';
import {
  ChatLikeEntity,
  ChatLikeOldEntity,
} from 'src/data/chat-data/entity/chat-like.entity';
import { ChatRoomEntity } from 'src/data/core-data/entity/chat-room.entity';
import {
  ChatEntity,
  ChatOldEntity,
} from 'src/data/chat-data/entity/chat.entity';
import { UserEntity } from 'src/data/core-data/entity/user.entity';
import { CommonException } from 'src/exception/common.exception';
import { Exclusion, In, LessThan, MoreThan, Repository } from 'typeorm';
import { ChatModel, ChatRoomModel } from './model/chat.models';
import { CHAT_DATA_SOURCE_NAME } from 'src/data/chat-data/chat-data.module';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatOldEntity, CORE_DATA_SOURCE_NAME)
    private chatCoreRepository: Repository<ChatEntity>,
    @InjectRepository(ChatEntity, CHAT_DATA_SOURCE_NAME)
    private chatChatRepository: Repository<ChatEntity>,
    @InjectRepository(ChatRoomEntity, CORE_DATA_SOURCE_NAME)
    private chatRoomRepository: Repository<ChatRoomEntity>,
    @InjectRepository(ChatJoinEntity, CORE_DATA_SOURCE_NAME)
    private chatJoinRepository: Repository<ChatJoinEntity>,
    @InjectRepository(ChatLikeOldEntity, CORE_DATA_SOURCE_NAME)
    private chatLikeCoreRepository: Repository<ChatLikeEntity>,
    @InjectRepository(ChatLikeEntity, CHAT_DATA_SOURCE_NAME)
    private chatLikeChatRepository: Repository<ChatLikeEntity>,
    @InjectRepository(UserEntity, CORE_DATA_SOURCE_NAME)
    private userRepository: Repository<UserEntity>,
  ) {
    // this.migrate();
  }

  async createRoom(name: string): Promise<ChatRoomModel> {
    try {
      const room = new ChatRoomEntity();
      room.name = name;

      await this.chatRoomRepository.save(room);

      return await this.getRoom(room.id);
    } catch (e) {
      console.log(e);
      throw new CommonException(999, 'failed to create room');
    }
  }

  async getRoom(id: number): Promise<ChatRoomModel | null> {
    const roomEntity = await this.getRoomEntity(id);

    if (roomEntity === null) {
      if (!roomEntity) {
        throw new CommonException(999, 'cannot find room');
      }
    }

    const noticeChat =
      roomEntity.noticeChatId > 0
        ? await this.chatCoreRepository.findOne({
            where: {
              id: roomEntity.noticeChatId,
            },
          })
        : null;

    const userIds = roomEntity.chatJoins.map((e) => e.userId);

    return {
      ...roomEntity,
      noticeChat,
      users: await this.userRepository.find({
        where: {
          id: In(userIds),
        },
      }),
    };
  }

  async getRoomList(
    userId: number,
    lastRoomId: number,
    size: number,
  ): Promise<Array<ChatRoomEntity>> {
    if (userId > 0) {
      return await this.chatRoomRepository
        .createQueryBuilder('cr')
        .innerJoin(
          ChatJoinEntity,
          'cj',
          `cj.roomId = cr.id and cj.userId = ${userId}`,
        )
        .andWhere(`cr.id < ${lastRoomId}`)
        .orderBy('cr.id', 'DESC')
        .limit(size)
        .getMany();
    } else {
      return await this.chatRoomRepository.find({
        order: { id: 'desc' },
        take: size,
      });
    }
  }

  async join(userId: number, roomId: number) {
    const join = await this.chatJoinRepository.findOne({
      where: {
        userId: userId,
        roomId: roomId,
      },
    });

    if (join) {
      return;
    }

    const chatJoin = new ChatJoinEntity();
    chatJoin.userId = userId;
    chatJoin.roomId = roomId;

    try {
      await this.chatJoinRepository.save(chatJoin);
    } catch (e) {
      throw new CommonException(999, 'failed to join chat');
    }
  }

  async getRoomEntity(id: number): Promise<ChatRoomEntity> {
    try {
      return await this.chatRoomRepository.findOne({
        where: { id: id },
        relations: { chatJoins: true },
      });
    } catch (e) {
      throw new CommonException(999, 'failed to find entity');
    }
  }

  async getChatMessages(
    searchUserId: number,
    roomId: number,
    lastChatId: number,
    size: number,
  ): Promise<Array<ChatModel>> {
    const chatList = await this.chatChatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect(
        'chat.likes',
        'chat_like',
        `chat_like.userId = ${searchUserId}`,
      )
      .where(`chat.roomId = ${roomId}`)
      .andWhere(`chat.id < ${lastChatId}`)
      .orderBy(`chat.id`, 'DESC')
      .limit(size)
      .getMany();

    const chatModelList = chatList.map(async (entity) => {
      return await this.convertChatModel(entity);
    });

    return await Promise.all(chatModelList);
  }

  async convertChatModel(entity: ChatEntity): Promise<ChatModel> {
    const chatLikes = await this.chatLikeCoreRepository.find({
      where: {
        chatId: entity.id,
      },
    });

    const chatUser = await this.userRepository.findOne({
      where: {
        id: entity.senderId,
      },
    });

    return {
      id: entity.id,
      content: entity.content,
      sender: chatUser,
      senderId: entity.senderId,
      roomId: entity.roomId,
      liked: entity.likes.length > 0,
      likeCount: chatLikes.length,
      createdAt: entity.createdAt,
    };
  }

  async createChat(
    userId: number,
    roomId: number,
    message: string,
  ): Promise<ChatEntity> {
    const chat = new ChatEntity();
    chat.senderId = userId;
    chat.roomId = roomId;
    chat.content = message;

    try {
      await this.chatChatRepository.save(chat);
      await this.chatCoreRepository.insert(chat);
    } catch (e) {
      console.log(e);

      try {
        await this.chatChatRepository.remove(chat);
        await this.chatCoreRepository.remove(chat);
      } catch (e) {}

      throw e;
    }

    return await this.chatCoreRepository.findOne({
      where: {
        id: chat.id,
      },
      relations: {
        likes: true,
      },
    });
  }

  async likeChat(userId: number, chatId: number) {
    const chatLike = await this.chatLikeCoreRepository.findOne({
      where: {
        userId: userId,
        chatId: chatId,
      },
    });

    if (chatLike) {
      return;
    }

    try {
      const chatLike = new ChatLikeEntity();
      chatLike.userId = userId;
      chatLike.chatId = chatId;

      await this.chatLikeChatRepository.save(chatLike);
      await this.chatLikeCoreRepository.insert(chatLike);
    } catch (error) {
      throw new CommonException(999, 'failed to create chat like');
    }
  }

  async noticeChat(roomId: number, chatId: number) {
    const room = await this.chatRoomRepository.findOne({
      where: {
        id: roomId,
      },
    });

    room.noticeChatId = chatId;

    try {
      await this.chatRoomRepository.save(room);
    } catch (error) {
      throw new CommonException(999, 'failed to notice chat');
    }
  }

  async migrate() {
    let lastChatId = 0;

    while (true) {
      const coreChatData = await this.chatCoreRepository.find({
        where: {
          id: MoreThan(lastChatId),
        },
        take: 1000,
        order: { id: 'asc' },
      });

      if (coreChatData.length === 0) {
        break;
      }

      await this.chatChatRepository.save(coreChatData);

      lastChatId = coreChatData[coreChatData.length - 1].id;
    }
  }

  async check() {
    let lastChatId = 0;

    while (true) {
      const coreChatData = await this.chatCoreRepository.find({
        where: {
          id: MoreThan(lastChatId),
        },
        take: 1000,
        order: { id: 'asc' },
      });

      for (const coreData of coreChatData) {
        const chatData = await this.chatChatRepository.findOne({
          where: {
            id: coreData.id,
          },
        });

        if (chatData === null) {
          throw 'failed';
        }

        // 추가
        const coreLikes = await this.chatLikeCoreRepository.find({
          where: { chatId: coreData.id },
        });
        
        const chatLikes = await this.chatLikeChatRepository.find({
          where: { chatId: coreData.id },
        });
  
        if (coreLikes.length !== chatLikes.length) {
          throw 'failed';
        }
  
        for (let i = 0; i < coreLikes.length; i++) {
          if (coreLikes[i].userId !== chatLikes[i].userId) {
            throw 'failed';
          }
        }

        if (
          chatData.content === coreData.content &&
          chatData.senderId === coreData.senderId
        ) {
          //todo: passed..
        }
      }
      lastChatId = coreChatData[coreChatData.length - 1].id;

    }
  }
}
