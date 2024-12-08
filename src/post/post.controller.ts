import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { PostService } from './post.service';
import { UserService } from './../user/user.service';
import { Post as PostModel, Post as PostDocument } from './schemas/post.schema';
import { JwtAuthGuard, OptionalJwtAuthGuard } from './../auth/guards';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService
  ) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get('tags')
  async findByTags(@Query('tags') tags: string, @Req() req: any): Promise<PostDocument[]> {
    const viewerId = req.user?._id || null; // 로그인한 사용자 ID 또는 null

    // 쉼표로 구분된 문자열을 배열로 변환
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    // 태그 배열이 비어있으면 에러 처리
    if (tagsArray.length === 0) {
      throw new Error('Tags query parameter must not be empty');
    }

    return this.postService.findByTags(tagsArray, viewerId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async findAll(@Req() req: any): Promise<PostDocument[]> {
    const viewerId = req.user?._id || null; // 로그인 상태가 아니면 viewerId는 null
    return this.postService.findAll(viewerId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  async findOne(@Param('slug') slug: string, @Req() req: any): Promise<PostDocument> {
    const userId = req.user?._id || null;
    return this.postService.findOne(slug, userId);
  }

  @Get(':userDomain/blog')
  async findBlogByUser(@Param('userDomain') userDomain: string, @Req() req: any) {
    // 유저 정보 조회
    const user = await this.userService.findByUserDomain(userDomain);
    if (!user) {
      throw new NotFoundException(`User with domain ${userDomain} not found`);
    }

    // 해당 유저의 게시글 조회
    const viewerId = req.user?._id || null; // 로그인 여부 확인
    const posts = await this.postService.findByAuthor(userDomain, viewerId);

    return { user, posts };
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
}
