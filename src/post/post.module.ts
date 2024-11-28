import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { UserModule } from '../user/user.module';
import { TagModule } from './../tag/tag.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]), UserModule, TagModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [MongooseModule],
})
export class PostModule {}
