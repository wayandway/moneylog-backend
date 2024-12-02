import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './schemas/post.schema';
import { User } from '../user/schemas/user.schema';
import { Tag } from './../tag/schemas/tag.schema';
import { validateTags } from '../utils';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Tag.name) private tagModel: Model<Tag>
  ) {}

  // 모든 게시물 조회
  async findAll(): Promise<Post[]> {
    return this.postModel.find().populate('author', 'userName email').exec();
  }

  // 특정 게시물 조회
  async findOne(id: string, viewerId?: string): Promise<Post> {
    const post = await this.postModel.findById(id).populate('author', 'userName email').exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // 비공개 글 접근 권한 확인
    if (post.isPrivate && post.author.toString() !== viewerId) {
      throw new NotFoundException(`You do not have access to this post`);
    }
    return post;
  }

  // 특정 유저의 게시물 조회
  async findByAuthor(userId: string, viewerId?: string): Promise<Post[]> {
    const posts = await this.postModel.find({ author: userId }).populate('author', 'userName email').exec();
    if (!posts || posts.length === 0) {
      throw new NotFoundException(`No posts found for user with ID ${userId}`);
    }

    // 비공개 글 필터링
    return posts.filter(post => !post.isPrivate || post.author.toString() === viewerId);
  }

  // 게시물 생성
  async create(data: Partial<Post>): Promise<Post> {
    // author 검증
    if (data.author) {
      const authorExists = await this.userModel.exists({ _id: data.author });
      if (!authorExists) {
        throw new NotFoundException(`Author with ID ${data.author} not found`);
      }
    }

    // 태그 검증 및 생성
    if (data.tags && data.tags.length > 0) {
      data.tags = await validateTags(data.tags, this.tagModel);
    }

    const newPost = new this.postModel(data);
    return newPost.save();
  }

  // 게시물 수정
  async update(id: string, data: Partial<Post>, userId: string): Promise<Post> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // 작성자 권한 확인
    if (post.author.toString() !== userId) {
      throw new NotFoundException(`You do not have permission to update this post`);
    }

    // 태그 검증 및 업데이트
    if (data.tags && data.tags.length > 0) {
      data.tags = await validateTags(data.tags, this.tagModel);
    }

    return this.postModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  // 게시물 삭제
  async delete(id: string, userId: string): Promise<{ message: string }> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // 작성자 권한 확인
    if (post.author.toString() !== userId) {
      throw new NotFoundException(`You do not have permission to delete this post`);
    }

    await this.postModel.findByIdAndDelete(id).exec();
    return { message: `Post with ID ${id} has been deleted.` };
  }
}
