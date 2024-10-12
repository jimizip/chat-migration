import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/data/core-data/entity/user.entity';
import { TypeOrmTestBase } from '../../test/test-database';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmTestBase([UserEntity]),
        TypeOrmModule.forFeature([UserEntity]),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('service defined', () => {
    expect(service).toBeDefined();
  });

  it('user create/delete', async () => {
    const user = await service.createUser(`muco${Date.now()}`);

    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('createdAt');
    expect(user).toHaveProperty('id');

    const deleted = await service.deleteUser(user.id);

    expect(deleted).toBeDefined();
  });
});
