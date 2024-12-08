import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostModel, Post as PostDocument } from './schemas/post.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async findAll(@Req() req: any): Promise<PostDocument[]> {
    const viewerId = req.user?._id;
    return this.postService.findAll(viewerId);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string, @Req() req: any): Promise<PostDocument> {
    const userId = req.user?._id;
    return this.postService.findOne(slug, userId);
  }

  @Get('users/:userDomain/posts')
  async findByAuthor(@Param('userDomain') userDomain: string, @Req() req: any): Promise<PostDocument[]> {
    const viewerId = req.user?.userDomain;
    return this.postService.findByAuthor(userDomain, viewerId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createPostDto: Partial<PostModel>, @Req() req: any): Promise<PostDocument> {
    const userObjectId = req.user._id;
    return this.postService.create(createPostDto, userObjectId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: Partial<PostModel>,
    @Req() req: any
  ): Promise<PostDocument> {
    const userObjectId = req.user._id;
    return this.postService.update(id, updatePostDto, userObjectId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any): Promise<{ message: string }> {
    const userObjectId = req.user._id;
    return this.postService.delete(id, userObjectId);
  }

  @Get('tags')
  async findByTags(@Query('tags') tags: string[]): Promise<PostDocument[]> {
    return this.postService.findByTags(tags);
  }
}
