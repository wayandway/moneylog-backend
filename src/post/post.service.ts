import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './schemas/post.schema';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // 모든 게시물 조회
  async findAll(): Promise<Post[]> {
    return this.postModel.find().populate('author', 'userName email').exec();
  }

  // 특정 게시물 조회
  async findOne(id: string): Promise<Post> {
    const post = await this.postModel.findById(id).populate('author', 'userName email').exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  // 특정 유저의 게시물 조회
  async findByAuthor(userId: string): Promise<Post[]> {
    const posts = await this.postModel
      .find({ author: userId })
      .populate('author', 'userName email')
      .exec();
    if (!posts || posts.length === 0) {
      throw new NotFoundException(`No posts found for user with ID ${userId}`);
    }
    return posts;
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

    const newPost = new this.postModel(data);
    return newPost.save();
  }

  // 게시물 수정
  async update(id: string, data: Partial<Post>): Promise<Post> {
    const updatedPost = await this.postModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return updatedPost;
  }

  // 게시물 삭제
  async delete(id: string): Promise<{ message: string }> {
    const deletedPost = await this.postModel.findByIdAndDelete(id).exec();
    if (!deletedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return { message: `Post has been deleted.` };
  }
}
