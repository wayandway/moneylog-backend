import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './schemas/comment.schema';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':postId')
  async findByPost(@Param('postId') postId: string): Promise<Comment[]> {
    return this.commentService.findByPost(postId);
  }

  @Post()
  async create(
    @Body('postId') postId: string,
    @Body('authorId') authorId: string,
    @Body('content') content: string
  ): Promise<Comment> {
    return this.commentService.create(postId, authorId, content);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body('content') content: string): Promise<Comment> {
    return this.commentService.update(id, content);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.commentService.delete(id);
  }
}
