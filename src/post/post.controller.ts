import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostDocument } from './schemas/post.schema';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async findAll(): Promise<PostDocument[]> {
    return this.postService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostDocument> {
    return this.postService.findOne(id);
  }

  @Get('user/:userId')
  async findByAuthor(@Param('userId') userId: string): Promise<PostDocument[]> {
    return this.postService.findByAuthor(userId);
  }

  @Post()
  async create(@Body() createPostDto: Partial<PostDocument>): Promise<PostDocument> {
    return this.postService.create(createPostDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: Partial<PostDocument>): Promise<PostDocument> {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.postService.delete(id);
  }
}
