export class ChatRoomCreateDto {
  name: string;
}

export class ChatJoinDto {
  userId: number;
  roomId: number;
}

export class ChatCreateDto {
  userId: number;
  roomId: number;
  message: string;
}

export class ChatLikeDto {
  userId: number;
  chatId: number;
}

export class ChatNoticeDto {
  roomdId: number;
  chatId: number;
}

export class ChatJoinSocketDto {
  roomId: number;
}

export class ChatMessageSocketDto {
  userId: number;
  roomId: number;
  message: string;
}
