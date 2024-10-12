import { createClient, RedisClientType } from 'redis';
import { Injectable } from '@nestjs/common';

// Redis 클라이언트를 설정
@Injectable()
export class RedisInstance {
  client: RedisClientType;
  subClient: RedisClientType;

  constructor() {
    this.client = createClient({
      url: `${process.env.REDIS_HOST}`,
      password: `${process.env.REDIS_PW}`,
      socket: {
        connectTimeout: 60000, // 연결 타임아웃 60초
      },
    });
    // Redis 클라이언트에서 발생하는 에러를 로깅
    this.client.on('error', (err) => {
      console.log('redis error ', err);
    });
    // Redis에 연결하고 성공 메시지를 로깅
    this.client.connect().then(() => {
      console.log('Connect to redis done');
    });
    // 메인 클라이언트를 복제하여 구독 전용 클라이언트를 생성
    this.subClient = this.client.duplicate();
    process.on('exit', () => {
      this.disconnect();
    });
    // 프로세스 종료 시 Redis 연결 종료
    process.on('SIGINT', () => {
      this.disconnect();
      process.exit(2);
    });
  }

  // Redis 클라이언트 연결 종료
  disconnect() {
    console.log('disconnect');
    this.client.quit();
  }
}
