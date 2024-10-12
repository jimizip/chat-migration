import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatJoinEntity } from 'src/data/core-data/entity/chat-join.entity';
import { ChatLikeEntity } from 'src/data/chat-data/entity/chat-like.entity';
import { ChatRoomEntity } from 'src/data/core-data/entity/chat-room.entity';
import { ChatEntity } from 'src/data/chat-data/entity/chat.entity';
import { UserEntity } from 'src/data/core-data/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { TypeOrmTestBase } from '../../test/test-database';
import { ChatService } from './chat.service';
import { ChatRoomModel } from './model/chat.models';

describe('ChatService', () => {
  let chatService: ChatService;
  let userService: UserService;

  const testUsers: Array<UserEntity> = [];
  let chatRoom: ChatRoomModel;

  const chatMessages = ['hello', 'world', 'monday', 'tuesday', 'one', 'two'];

  const MAX_INT = 2147483647;

  beforeEach(async () => {
    const entities = [
      UserEntity,
      ChatEntity,
      ChatRoomEntity,
      ChatJoinEntity,
      ChatLikeEntity,
    ];

    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmTestBase(entities), TypeOrmModule.forFeature(entities)],
      providers: [UserService, ChatService],
    }).compile();

    chatService = module.get<ChatService>(ChatService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(chatService).toBeDefined();
    expect(userService).toBeDefined();
  });

  it('user create advance...', async () => {
    for (let i = 0; i < 2; i++) {
      const user = await userService.createUser(`testUser${Date.now()}`);
      testUsers.push(user);
    }

    expect(testUsers.length).toBeGreaterThanOrEqual(2);
  });

  it('create chat room', async () => {
    chatRoom = await chatService.createRoom(`testChat${Date.now()}`);

    expect(chatRoom).toBeDefined();
  });

  it('join chat room', async () => {
    for (const user of testUsers) {
      await chatService.join(user.id, chatRoom.id);
    }

    const chatRoomEntity = await chatService.getRoomEntity(chatRoom.id);

    chatRoomEntity.chatJoins.forEach((join) => {
      expect(
        testUsers.filter((user) => user.id === join.userId).length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it('room list', async () => {
    const user = testUsers[0];
    const roomList = await chatService.getRoomList(user.id, MAX_INT, 10);

    expect(roomList.length).toBe(1);
  });

  it('create chat', async () => {
    for (let index = 0; index < chatMessages.length; index++) {
      await chatService.createChat(
        testUsers[index % testUsers.length].id,
        chatRoom.id,
        chatMessages[index],
      );
    }

    const userChatList = await chatService.getChatMessages(
      0,
      chatRoom.id,
      MAX_INT,
      50,
    );

    expect(userChatList.length).toBe(chatMessages.length);
  });

  it('like chat', async () => {
    const chatList = await chatService.getChatMessages(
      0,
      chatRoom.id,
      MAX_INT,
      50,
    );

    const likeUserId = chatList[0].senderId;

    for (const chat of chatList) {
      await chatService.likeChat(likeUserId, chat.id);
    }

    const newChatList = await chatService.getChatMessages(
      likeUserId,
      chatRoom.id,
      MAX_INT,
      50,
    );

    for (const chat of newChatList) {
      expect(chat.liked).toBe(true);
      expect(chat.likeCount).toBeGreaterThan(0);
    }
  });

  it('notice chat', async () => {
    const chatList = await chatService.getChatMessages(
      0,
      chatRoom.id,
      MAX_INT,
      50,
    );

    if (chatList.length > 0) {
      await chatService.noticeChat(chatRoom.id, chatList[0].id);

      chatRoom = await chatService.getRoom(chatRoom.id);

      expect(chatRoom.noticeChat.id).toBe(chatList[0].id);
      expect(chatRoom.noticeChat.content).toBe(chatList[0].content);
    } else {
      expect(1).toBe(0);
    }
  });

  it('chat and chat_like data consistency between Core DB and Chat DB', async () => {
    try {
      await chatService.check();
      // If no error
      // console.log('데이터 일치');
    } catch (error) {
      fail('Data inconsistency found between Core DB and Chat DB');
    }
  });
});

