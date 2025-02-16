import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, ExecutionContext, Req } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { User } from '../entities/user.entity';
import { Permissions } from '../decorators/permissions.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Request } from 'express';

@Controller('user')
@UseGuards(PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create-application-user')
  @Permissions('createUser')
  createApplicationUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    const userDto = { ...createUserDto, isApiUser: false };
    return this.userService.create(userDto);
  }

  @Post('create-api-user')
  createApiUser(@Body() createUserDto: any): Promise<any> {
    const userDto = { ...createUserDto, isApiUser: true };
    return this.userService.create(userDto);
  }

  @Post('refresh-token')
  @Permissions('tokens')
  refreshToken(@Req() request: Request): Promise<any> {
    return this.userService.generateRefreshToken(request);
  }

  @Post('access-token')
  @Permissions('tokens')
  accessToken(@Req() request: Request): Promise<any> {
    return this.userService.generateAccessToken(request);
  }

  @Put(':id/update-password')
  @Permissions('updateUser')
  updatePassword(@Param('id') id: number, @Body() updatePasswordDto: UpdatePasswordDto): Promise<void> {
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @Get()
  @Permissions('listUser')
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @Permissions('listUser')
  findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Delete(':id')
  @Permissions('deleteUser')
  remove(@Param('id') id: number): Promise<void> {
    return this.userService.remove(id);
  }
}
