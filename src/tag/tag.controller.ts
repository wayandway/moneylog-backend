import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './schemas/tag.schema';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async findAll(): Promise<Tag[]> {
    return this.tagService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Tag> {
    return this.tagService.findOne(id);
  }

  @Post()
  async create(@Body('name') name: string): Promise<Tag> {
    return this.tagService.create(name);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.tagService.delete(id);
  }
}
