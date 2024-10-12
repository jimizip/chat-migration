import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ChatRoomEntity } from 'src/data/core-data/entity/chat-room.entity';
import { ChatService } from './chat.service';
import {
  ChatCreateDto,
  ChatJoinDto,
  ChatLikeDto,
  ChatNoticeDto,
  ChatRoomCreateDto as RoomCreateDto,
} from './dto/chat.dto';
import { ChatModel, ChatRoomModel } from './model/chat.models';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/room')
  async createRoom(
    @Req() req: any,
    @Body() dto: RoomCreateDto,
  ): Promise<ChatRoomModel> {
    return await this.chatService.createRoom(dto.name);
  }

  @Get('/room')
  async getRoom(
    @Req() req: any,
    @Query('roomId') roomId: number,
  ): Promise<ChatRoomModel> {
    return await this.chatService.getRoom(roomId);
  }

  @Get('/room/list')
  async getRoomList(
    @Req() req: any,
    @Query('userId') userId: number,
    @Query('lastRoomId') lastRoomId: number,
    @Query('size') size: number,
  ): Promise<Array<ChatRoomEntity>> {
    return await this.chatService.getRoomList(userId, lastRoomId, size);
  }

  @Post('/room/join')
  async joinRoom(@Req() req: any, @Body() dto: ChatJoinDto) {
    return await this.chatService.join(dto.userId, dto.roomId);
  }

  @Post('/room/notice')
  async noticeRoom(@Req() req: any, @Body() dto: ChatNoticeDto) {
    return await this.chatService.noticeChat(dto.roomdId, dto.chatId);
  }

  @Post('/message/like')
  async likeMessage(@Req() req: any, @Body() dto: ChatLikeDto) {
    return await this.chatService.likeChat(dto.userId, dto.chatId);
  }

  @Get('/message/list')
  async listMessage(
    @Req() req: any,
    @Query('userId') userId: number | undefined | null,
    @Query('roomId') roomId: number,
    @Query('lastChatId') lastChatId: number,
    @Query('size') size: number,
  ): Promise<Array<ChatModel>> {
    return await this.chatService.getChatMessages(
      userId > 0 ? userId : 0,
      roomId,
      lastChatId,
      size,
    );
  }

  @Post('/message')
  async createMessage(@Body() dto: ChatCreateDto) {
    return await this.chatService.createChat(
      dto.userId,
      dto.roomId,
      dto.message,
    );
  }
}
