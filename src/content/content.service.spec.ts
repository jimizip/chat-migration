import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentLikeEntity } from 'src/data/entity/content-like.entity';
import { ContentEntity } from 'src/data/entity/content.entity';
import { UserEntity } from 'src/data/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { TypeOrmTestBase } from '../../test/test-database';
import { ContentService } from './content.service';

describe('ContentService', () => {
  let contentService: ContentService;
  let userService: UserService;

  const testUsers: Array<UserEntity> = [];
  const testContents: Array<ContentEntity> = [];

  beforeEach(async () => {
    const entities = [UserEntity, ContentEntity, ContentLikeEntity];

    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmTestBase(entities), TypeOrmModule.forFeature(entities)],
      providers: [ContentService, UserService],
    }).compile();

    contentService = module.get<ContentService>(ContentService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(contentService).toBeDefined();
    expect(userService).toBeDefined;
  });

  it('user create advance...', async () => {
    for (let i = 0; i < 2; i++) {
      const user = await userService.createUser(`testUser${Date.now()}`);
      testUsers.push(user);
    }

    expect(testUsers.length).toBeGreaterThanOrEqual(2);
  });

  it('user create content', async () => {
    for (const user of testUsers) {
      const content = await contentService.createContent(
        `title${Date.now()}`,
        `content${Date.now()}`,
        user.id,
      );
      testContents.push(content);
    }
    expect(testContents.length).toBeGreaterThanOrEqual(2);
  });

  it('user like content', async () => {
    for (const user of testUsers) {
      for (const content of testContents) {
        await contentService.likeContent(content.id, user.id);
      }
    }
  });
});
