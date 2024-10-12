import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/data/core-data/entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CORE_DATA_SOURCE_NAME } from 'src/data/core-data/core-data.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity], CORE_DATA_SOURCE_NAME)],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
