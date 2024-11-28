import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './schemas/tag.schema';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  // 모든 태그 조회
  @Get()
  async findAll(): Promise<Tag[]> {
    return this.tagService.findAll();
  }

  // 특정 태그 조회 (태그명 기반)
  @Get(':name')
  async findByName(@Param('name') name: string): Promise<Tag> {
    return this.tagService.findByName(name);
  }

  // 태그 생성
  @Post()
  async create(@Body('name') name: string): Promise<Tag> {
    return this.tagService.create(name);
  }

  // 태그 삭제 (태그명 기반)
  @Delete(':name')
  async delete(@Param('name') name: string): Promise<{ message: string }> {
    return this.tagService.delete(name);
  }
}
