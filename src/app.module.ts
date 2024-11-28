import { Module, Post } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { TagModule } from './tag/tag.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    // 환경 변수 설정 (전역 사용 가능)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // MongoDB 연결 설정
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'), // 환경 변수에서 MongoDB URI 가져오기
        useNewUrlParser: true, // MongoDB 드라이버 옵션 추가
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),

    UserModule,
    PostModule,
    TagModule,
    CommentModule,
  ],
})
export class AppModule {}
