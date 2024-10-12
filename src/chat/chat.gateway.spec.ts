// 테스트 목적
// - Gateway 인스턴스가 제대로 생성되는지
// - Redis 클라이언트 초기화와 채널 구독이 올바르게 이루어지는지
// - 채팅방 참여 기능이 정상적으로 작동하는지
// - 채팅 메시지 전송 및 Redis 발행이 올바르게 수행되는지

import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { createClient } from 'redis';

// Redis 클라이언트 모킹
// 각 테스트는 모의 객체(mocks)를 사용하여 외부 의존성을 제어하고, 예상된 동작을 검증
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue(undefined),
    duplicate: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockResolvedValue(undefined),
    publish: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;

  // 모의 Socket 객체 생성
  const mockSocket = {
    join: jest.fn(),
    emit: jest.fn(),
  } as unknown as Socket;

  // 모의 Server 객체 생성
  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    // 테스트 모듈 설정
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: {
            getRoom: jest.fn(),
            createChat: jest.fn(),
            convertChatModel: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);

    // Server 객체 설정
    gateway.server = mockServer as any;

    // Redis 클라이언트 초기화
    await gateway.afterInit(mockServer as any);
  });

  // ChatGateway 인스턴스가 정의되었는지 확인하는 테스트
  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  // afterInit 메서드가 Redis 클라이언트를 초기화하고 chat_messages 채널을 구독하는지 테스트
  describe('afterInit', () => {
    it('should initialize Redis clients and subscribe to chat_messages', async () => {
      // Redis 클라이언트 생성 함수가 호출되었는지 확인
      expect(createClient).toHaveBeenCalled();
      // redisSubscriber가 'chat_messages' 채널을 구독했는지 확인
      expect(gateway['redisSubscriber'].subscribe).toHaveBeenCalledWith('chat_messages', expect.any(Function));
    });
  });

  // handleJoin 메서드가 채팅방에 참여하고 방 데이터를 emit하는지 테스트
  // (Socket.IO를 사용하여 특정 채팅방과 관련된 정보를 클라이언트에게 전송하는 지)
  describe('handleJoin', () => {
    it('should join a room and emit room data', async () => {
      // 모의 채팅방 객체 생성
      const mockRoom = { id: 1, name: 'Test Room' };
      // chatService.getRoom 메서드가 mockRoom을 반환하도록 설정
      (chatService.getRoom as jest.Mock).mockResolvedValue(mockRoom);

      // handleJoin 메서드 호출
      await gateway.handleJoin({ roomId: 1 }, mockSocket);

      // 소켓이 'room:1'에 join 되었는지 확인
      expect(mockSocket.join).toHaveBeenCalledWith('room:1');
      // 소켓이 'room' 이벤트와 함께 mockRoom 데이터를 emit했는지 확인
      expect(mockSocket.emit).toHaveBeenCalledWith('room', { room: mockRoom });
    });
  });

  // send 메서드가 채팅 메시지를 생성하고 Redis에 발행하는지 테스트
  describe('send', () => {
    it('should create a chat message and publish to Redis', async () => {
      // 모의 채팅 엔티티와 모델 생성
      const mockChatEntity = { id: 1, content: 'Test message' };
      const mockChatModel = { id: 1, content: 'Test message', sender: { id: 1, name: 'User' } };
      // chatService의 메서드들이 모의 데이터를 반환하도록 설정
      (chatService.createChat as jest.Mock).mockResolvedValue(mockChatEntity);
      (chatService.convertChatModel as jest.Mock).mockResolvedValue(mockChatModel);

      await gateway.send(mockSocket, { userId: 1, roomId: 1, message: 'Test message' });

      // chatService.createChat이 올바른 인자로 호출되었는지 확인
      expect(chatService.createChat).toHaveBeenCalledWith(1, 1, 'Test message');
      // chatService.convertChatModel이 mockChatEntity로 호출되었는지 확인
      expect(chatService.convertChatModel).toHaveBeenCalledWith(mockChatEntity);
      // redisPublisher.publish가 'chat_messages' 채널에 문자열을 발행했는지 확인
      expect(gateway['redisPublisher'].publish).toHaveBeenCalledWith('chat_messages', expect.any(String));
    });
  });
});
