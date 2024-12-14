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

  //* 게시글 전체 조회
  async findAll(viewerId?: string): Promise<Post[]> {
    const filter: any = {};

    if (!viewerId) {
      filter.isPrivate = false;
    } else {
      filter.$or = [{ isPrivate: false }, { author: new Types.ObjectId(viewerId) }];
    }

    return this.postModel
      .find(filter)
      .populate('author', 'userName email') // 작성자 정보
      .populate({
        path: 'comments', // 댓글 필드
        model: 'Comment', // 명확하게 Comment 모델 참조
        populate: { path: 'author', select: 'userName email' }, // 댓글 작성자 정보
      })
      .exec();
  }

  //* 게시글 조회 (특정 유저)
  async findByAuthor(userDomain: string, viewerId?: string): Promise<Post[]> {
    const user = await this.userModel.findOne({ userDomain: { $regex: new RegExp(`^${userDomain}$`, 'i') } }).exec();
    if (!user) {
      throw new NotFoundException(`User with domain ${userDomain} not found`);
    }

    const posts = await this.postModel
      .find({ author: user._id })
      .populate('author', 'userName email') // 게시물 작성자 정보
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'userName email' }, // 댓글 작성자 정보
      })
      .exec();

    if (!posts || posts.length === 0) {
      throw new NotFoundException(`No posts found for user with domain ${userDomain}`);
    }

    return posts.filter(post => !post.isPrivate || (viewerId && post.author._id.toString() === viewerId.toString()));
  }

  //* 게시글 검색 (슬러그 기반)
  async findOne(slug: string, userId?: string): Promise<Post> {
    const post = await this.postModel
      .findOne({ slug })
      .populate('author', 'userName email') // 게시물 작성자 정보
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'userName email' }, // 댓글 작성자 정보
      })
      .exec();

    if (!post) {
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }

    if (post.isPrivate && (!userId || post.author._id.toString() !== userId.toString())) {
      throw new NotFoundException(`You do not have access to this post`);
    }

    return post;
  }

  //* 게시글 조회 (태그 기반)
  async findByTags(tags: string[], viewerId?: string): Promise<Post[]> {
    const filter: any = {
      tags: { $in: tags }, // 태그 배열에 해당하는 게시글 필터링
    };

    if (!viewerId) {
      filter.isPrivate = false; // 비로그인 상태에서는 공개 게시글만 조회
    } else {
      filter.$or = [
        { isPrivate: false }, // 공개 게시글
        { author: new Types.ObjectId(viewerId) }, // 본인의 비공개 게시글
      ];
    }

    return this.postModel
      .find(filter)
      .populate('author', 'userName email') // 게시물 작성자 정보
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'userName email' }, // 댓글 작성자 정보
      })
      .exec();
  }
}
