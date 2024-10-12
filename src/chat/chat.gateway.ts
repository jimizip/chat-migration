import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatJoinSocketDto, ChatMessageSocketDto } from './dto/chat.dto';
import { createClient } from 'redis';

// 소켓 설정
@WebSocketGateway({
  transport: ['websocket'], // 전송 방식
  namespace: '/',
  cors: {
    origin: '*', // 모든 출처에 대해 허용
  },
})

export class ChatGateway implements OnGatewayInit {
  // ChatService를 주입받아 채팅 관련 비즈니스 로직을 처리
  constructor(private readonly chatService: ChatService) {}

  // Socket.io 서버 인스턴스에 접근
  @WebSocketServer()
  server: Server;

  // Redis의 pub/sub 기능을 활용
  private redisPublisher; // Redis 발행자 클라이언트
  private redisSubscriber; // Redis 구독자 클라이언트

  // 게이트웨이 초기화 시 호출되는 메서드
  async afterInit(server: Server) {
    console.log(`WebSocket Gateway initialized on port ${process.env.PORT || 3001}`);

    // Redis 클라이언트 생성
    this.redisPublisher = createClient({
      url: process.env.REDIS_HOST || 'redis://localhost:6379',
      password: `${process.env.REDIS_PW}`,
    });
    this.redisSubscriber = this.redisPublisher.duplicate();

    // Redis 연결
    await Promise.all([this.redisPublisher.connect(), this.redisSubscriber.connect()]);

    // Redis 채널 구독
    await this.redisSubscriber.subscribe('chat_messages', (message) => {
      const chatData = JSON.parse(message);
      console.log(`[Port ${process.env.PORT || 3001}] Received message from Redis:`, chatData);
      
      // 받은 메시지를 해당 방의 모든 클라이언트에게 브로드캐스트
      this.server.to(this.socketRoomName(chatData.roomId)).emit('message', {
        chat: chatData.chatModel
      });
    });
  }

  // 채팅방 ID를 기반으로 소켓 방 이름을 생성
  private socketRoomName(roomId: number) {
    return `room:${roomId}`;
  }

  // 클라이언트가 'join' 이벤트를 보내면 해당 채팅방에 소켓을 연결
  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() body: ChatJoinSocketDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const chatRoom = await this.chatService.getRoom(body.roomId);
      socket.join(this.socketRoomName(body.roomId));

      // 채팅방 정보를 클라이언트에게 전송
      socket.emit('room', {
        room: chatRoom,
      });
    } catch (e) {
      console.log(e);
    }
  }

  // 클라이언트가 'message' 이벤트를 보내면 새 채팅 메시지를 생성
  @SubscribeMessage('message')
  async send(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: ChatMessageSocketDto,
  ) {
    try {
      const chatEntity = await this.chatService.createChat(
        body.userId,
        body.roomId,
        body.message,
      );

      // 생성된 메시지를 해당 채팅방의 모든 클라이언트에게 브로드캐스트
      const chatModel = await this.chatService.convertChatModel(chatEntity);

      console.log(`[Port ${process.env.PORT || 3001}] Broadcasting message to room ${body.roomId}:`, chatModel);

      // Redis를 통해 메시지 발행
      await this.redisPublisher.publish('chat_messages', JSON.stringify({
        roomId: body.roomId,
        chatModel: chatModel,
        sourcePort: process.env.PORT || 3001
      }));

    } catch (e) {
      console.log(e);
    }
  }
}
