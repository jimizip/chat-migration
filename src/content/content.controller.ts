import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentCreateDto, ContentLikeDto } from './dto/content.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('/')
  async createPost(@Req() req: any, @Body() dto: ContentCreateDto) {
    return await this.contentService.createContent(
      dto.title,
      dto.data,
      dto.userId,
    );
  }

  @Get('/')
  async getContent(@Req() req: any, @Query('contentId') contentId: number) {
    return await this.contentService.getContent(contentId);
  }

  @Get('/like')
  async likeContent(@Req() req: any, @Body() dto: ContentLikeDto) {
    return await this.contentService.likeContent(dto.contentId, dto.userId);
  }
}
