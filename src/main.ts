import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { CommonExceptionFilter } from './exception/common.exception';
import { join } from 'path';
import { RedisIoAdapter } from './client/redis/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.useGlobalFilters(new CommonExceptionFilter());

  // Redis 어댑터 인스턴스 생성
  const redisIoAdapter = new RedisIoAdapter(app);
  // Redis 연결
  await redisIoAdapter.connectToRedis().catch(err => {
    console.error('Redis 어댑터 초기화 실패:', err);
    process.exit(1);
  });
  // WebSocket 어댑터로 Redis 어댑터 사용 설정
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(3001);
}
bootstrap();
