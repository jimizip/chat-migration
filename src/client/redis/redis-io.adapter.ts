import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

// IoAdapter를 상속받아 NestJS의 WebSocket 어댑터를 확장
// Redis를 사용함으로써 여러 서버 인스턴스 간에 Socket.IO 이벤트를 동기화
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  // Redis 클라이언트 생성, 연결
  async connectToRedis(): Promise<void> {
    // Pub/Sub 클라이언트를 설정
    try {
      const pubClient = createClient({
        url: `${process.env.REDIS_HOST}`,
        password: `${process.env.REDIS_PW}`,
      });
      const subClient = pubClient.duplicate();
      await Promise.all([pubClient.connect(), subClient.connect()]);
      // Redis 어댑터를 생성
      this.adapterConstructor = createAdapter(pubClient, subClient); 
      console.log('Redis 어댑터 연결 성공');
    } catch (error) {
      console.error('Redis error: ', error);
      throw error;
    }
  }

  // Socket.IO 서버를 생성, 생성된 서버에 Redis 어댑터를 적용
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
