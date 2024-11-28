import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Post } from '../../post/schemas/post.schema';

@Schema({ timestamps: true, versionKey: false })
export class Comment extends Document {
  @Prop({ required: true })
  content: string; // 댓글 내용

  @Prop({ type: Types.ObjectId, ref: Post.name, required: true })
  post: Post; // 게시물

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  author: User; // 작성자

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
