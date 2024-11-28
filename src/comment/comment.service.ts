import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './schemas/comment.schema';
import { Post } from '../post/schemas/post.schema';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  // 특정 게시물의 댓글 조회
  async findByPost(postId: string): Promise<Comment[]> {
    const postExists = await this.postModel.exists({ _id: postId });
    if (!postExists) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    return this.commentModel.find({ post: postId }).populate('author', 'userName email').exec();
  }

  // 댓글 생성
  async create(postId: string, authorId: string, content: string): Promise<Comment> {
    const postExists = await this.postModel.exists({ _id: postId });
    const authorExists = await this.userModel.exists({ _id: authorId });

    if (!postExists) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
    if (!authorExists) {
      throw new NotFoundException(`User with ID ${authorId} not found`);
    }

    const newComment = new this.commentModel({ content, post: postId, author: authorId });
    return newComment.save();
  }

  // 댓글 수정
  async update(commentId: string, content: string): Promise<Comment> {
    if (!content) {
      throw new BadRequestException('Content is required to update a comment');
    }

    const updatedComment = await this.commentModel
      .findByIdAndUpdate(commentId, { content, updatedAt: Date.now() }, { new: true })
      .exec();

    if (!updatedComment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }
    return updatedComment;
  }

  // 댓글 삭제
  async delete(commentId: string): Promise<{ message: string }> {
    const deletedComment = await this.commentModel.findByIdAndDelete(commentId).exec();
    if (!deletedComment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }
    return { message: `Comment has been deleted.` };
  }
}
