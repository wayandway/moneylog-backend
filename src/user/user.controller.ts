import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 모든 유저 조회
  @Get()
  async findAll(): Promise<User[]> {
    try {
      return await this.userService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(`Failed to retrieve users: ${error.message}`);
    }
  }

  // 특정 유저 조회 (ID 기반)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    try {
      const user = await this.userService.findOne(id);
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve the user');
    }
  }

  // 특정 유저 조회 (userId 기반)
  @Get('userId/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<User> {
    try {
      const user = await this.userService.findByUserId(userId);
      if (!user) {
        throw new NotFoundException(`User with userId ${userId} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve the user');
    }
  }

  // 유저 생성
  @Post()
  async create(@Body() createUserDto: Partial<User>): Promise<User> {
    try {
      if (!createUserDto.userName || !createUserDto.email || !createUserDto.password || !createUserDto.userId) {
        throw new BadRequestException('userId, userName, email, and password are required');
      }
      return await this.userService.create(createUserDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  // 유저 수정
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: Partial<User>): Promise<User> {
    try {
      const updatedUser = await this.userService.update(id, updateUserDto);
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  // 유저 삭제
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const deletedUser = await this.userService.delete(id);
      if (!deletedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return { message: `User data has been successfully deleted.` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
