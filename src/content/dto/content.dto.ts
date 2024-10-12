export class ContentCreateDto {
  title: string;
  data: string;
  userId: number;
}

export class ContentLikeDto {
  userId: number;
  contentId: number;
}
