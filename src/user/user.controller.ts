import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UserCreateDto } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/')
  async createUser(@Req() req: any, @Body() dto: UserCreateDto) {
    return this.userService.createUser(dto.name);
  }

  @Get('/list')
  async getUsers(@Req() req: any) {
    return this.userService.getUsers();
  }
}
