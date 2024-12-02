import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostDocument } from './schemas/post.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // 모든 게시물 조회 (공개 글만 반환)
  @Get()
  async findAll(): Promise<PostDocument[]> {
    return this.postService.findAll();
  }

  // 특정 게시물 조회 (비공개 글은 작성자 본인만 접근 가능)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any): Promise<PostDocument> {
    const userId = req.user?.userId; // JWT를 통해 사용자 ID를 확인 (로그인하지 않은 경우 undefined)
    return this.postService.findOne(id, userId);
  }

  // 특정 유저의 게시물 조회 (공개 글만 반환)
  @Get('user/:userId')
  async findByAuthor(@Param('userId') userId: string, @Req() req: any): Promise<PostDocument[]> {
    const viewerId = req.user?.userId; // 로그인 사용자의 ID를 가져옴
    return this.postService.findByAuthor(userId, viewerId);
  }

  // 게시물 생성 (로그인 필요)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createPostDto: Partial<PostDocument>, @Req() req: any): Promise<PostDocument> {
    return this.postService.create({ ...createPostDto, author: req.user.userId });
  }

  // 게시물 수정 (작성자 본인만 가능)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: Partial<PostDocument>,
    @Req() req: any
  ): Promise<PostDocument> {
    return this.postService.update(id, updatePostDto, req.user.userId);
  }

  // 게시물 삭제 (작성자 본인만 가능)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any): Promise<{ message: string }> {
    return this.postService.delete(id, req.user.userId);
  }
}
