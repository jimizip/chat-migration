import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { ContentEntity } from 'src/data/core-data/entity/content.entity';
import { ContentLikeEntity } from 'src/data/core-data/entity/content-like.entity';
import { UserEntity } from 'src/data/core-data/entity/user.entity';
import { CORE_DATA_SOURCE_NAME } from 'src/data/core-data/core-data.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ContentEntity, ContentLikeEntity, UserEntity],
      CORE_DATA_SOURCE_NAME,
    ),
  ],
  providers: [ContentService],
  exports: [ContentService],
  controllers: [ContentController],
})
export class ContentModule {}
