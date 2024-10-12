import { Controller, Get, Query, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatService } from './chat/chat.service';
import { ContentService } from './content/content.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chatService: ChatService,
    private readonly contentService: ContentService,
  ) {}

  @Get()
  @Render('index')
  async root(@Query('roomId') roomId: number, @Query('userId') userId: number) {
    const room = await this.chatService.getRoom(roomId);

    const messages = await this.chatService.getChatMessages(
      userId,
      roomId,
      ~(1 << 31),
      10,
    );

    return {
      roomId,
      userId,
      messages: messages.reverse(),
      notice:
        room.noticeChat !== null ? room.noticeChat.content : '공지가 없습니다',
    };
  }

  @Get('/content-view')
  @Render('content')
  async content(@Query('contentId') contentId: number) {
    const content = await this.contentService.getContent(contentId);

    return {
      title: content.title,
      data: content.data,
    };
  }
}
