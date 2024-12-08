import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema';
import { User } from '../user/schemas/user.schema';
import slugify from 'slugify';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async create(data: Partial<Post>, userId: string): Promise<Post> {
    // Author 검증
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid author ObjectId');
    }

    const authorExists = await this.userModel.exists({ _id: userId });
    if (!authorExists) {
      throw new NotFoundException('Author not found');
    }

    // Slug 생성
    const generatedSlug = slugify(data.title || '', {
      strict: false, // 특수문자 유지
      locale: 'ko', // 한글 로케일 설정
      remove: /[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ]/g, // 허용되지 않은 문자 제거
    });

    let slug = generatedSlug;

    // 중복 슬러그 처리
    let slugExists = Boolean(await this.postModel.exists({ slug }));
    let counter = 1;

    while (slugExists) {
      slug = `${generatedSlug}-${counter}`;
      slugExists = Boolean(await this.postModel.exists({ slug }));
      counter++;
    }

    // 새 게시물 생성
    const newPost = new this.postModel({
      ...data,
      author: new Types.ObjectId(userId),
      slug,
    });

    return await newPost.save();
  }

  async update(id: string, data: Partial<Post>, userId: string): Promise<Post> {
    const post = await this.postModel.findById(id).populate('author').exec();

    // 게시물이 존재하지 않을 경우
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // 작성자가 없거나 잘못된 경우
    if (!post.author) {
      throw new NotFoundException('Post author not found');
    }

    if (post.author._id.toString() !== userId.toString()) {
      throw new NotFoundException(`You do not have permission to update this post`);
    }

    // Slug 업데이트 처리 (제목 변경 시)
    if (data.title) {
      const generatedSlug = slugify(data.title, {
        strict: false,
        locale: 'ko',
        remove: /[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ]/g,
      });

      let slug = generatedSlug;
      let slugExists = await this.postModel.exists({ slug });
      let counter = 1;

      while (slugExists) {
        slug = `${generatedSlug}-${counter}`;
        slugExists = await this.postModel.exists({ slug });
        counter++;
      }

      data.slug = slug;
    }

    // 게시물 업데이트
    return this.postModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (post.author._id.toString() !== userId.toString()) {
      throw new NotFoundException(`You do not have permission to delete this post`);
    }

    await this.postModel.findByIdAndDelete(id).exec();
    return { message: `Post with ID ${id} has been deleted.` };
  }

  async findAll(viewerId?: string): Promise<Post[]> {
    const filter: any = {};

    if (!viewerId) {
      // 비로그인 상태에서는 공개된 글만 조회
      filter.isPrivate = false;
    } else {
      // 로그인 상태에서는 본인의 글(공개/비공개) 또는 다른 사용자의 공개 글만 조회
      filter.$or = [
        { isPrivate: false }, // 공개 글
        { author: new Types.ObjectId(viewerId) }, // 본인의 글 (공개/비공개 포함)
      ];
    }

    return this.postModel.find(filter).populate('author', 'userName email').exec();
  }

  async findOne(slug: string, userId?: string): Promise<Post> {
    const post = await this.postModel.findOne({ slug }).populate('author', 'userName email').exec();
    if (!post) {
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }

    // 권한 확인 (비공개 글 접근 제한)
    if (post.isPrivate) {
      if (!userId || post.author._id.toString() !== userId.toString()) {
        throw new NotFoundException(`You do not have access to this post`);
      }
    }

    return post;
  }

  async findByAuthor(userDomain: string, viewerId?: string): Promise<Post[]> {
    const user = await this.userModel.findOne({ userDomain }).exec();
    if (!user) {
      throw new NotFoundException(`User with domain ${userDomain} not found`);
    }

    const posts = await this.postModel.find({ author: user._id }).populate('author', 'userName email').exec();
    if (!posts || posts.length === 0) {
      throw new NotFoundException(`No posts found for user with domain ${userDomain}`);
    }

    // 비공개 글 필터링
    return posts.filter(post => !post.isPrivate || (viewerId && post.author.toString() === viewerId.toString()));
  }

  async findByTags(tags: string[]): Promise<Post[]> {
    return this.postModel
      .find({ tags: { $in: tags }, isPrivate: false })
      .populate('author', 'userName email')
      .exec();
  }
}
