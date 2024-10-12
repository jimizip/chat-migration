import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { ContentModule } from './content/content.module';
import { CoreDataModule } from './data/core-data/core-data.module';
import { ChatDataModule } from './data/chat-data/chat-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `dev.env`,
    }),
    UserModule,
    ChatModule,
    ContentModule,
    CoreDataModule,
    ChatDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
