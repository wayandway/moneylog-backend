import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import { MailerService } from '@nestjs-modules/mailer';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService
  ) {}

  /**
   * 회원가입 요청
   */
  async register(userDto: Partial<User>): Promise<{ message: string }> {
    const { email, userName, password, userId } = userDto;

    // 이메일 및 userId 중복 확인
    const existingUser = await this.userModel.findOne({ $or: [{ email }, { userId }] }).exec();
    if (existingUser) {
      throw new BadRequestException('Email or User ID is already registered');
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // JWT 토큰 생성 (이메일 인증용)
    const token = jwt.sign(
      { email, userName, password: hashedPassword, userId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // 토큰 만료시간
    );

    // 이메일 전송
    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification',
      template: './email-verification', // 템플릿 파일 경로
      context: {
        userName,
        verificationUrl: `http://localhost:3000/auth/verify-email?token=${token}`, // 인증 링크
      },
    });

    return { message: 'User registered successfully. Please verify your email.' };
  }

  /**
   * 이메일 인증
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        email: string;
        userName: string;
        password: string;
        userId: string;
      };

      // 이미 등록된 유저인지 확인
      const existingUser = await this.userModel.findOne({ email: decoded.email }).exec();
      if (existingUser) {
        throw new BadRequestException('User already verified or registered');
      }

      // 유저 데이터 저장
      const newUser = new this.userModel({
        email: decoded.email,
        userName: decoded.userName,
        password: decoded.password, // 이미 암호화된 비밀번호
        userId: decoded.userId,
      });

      await newUser.save();

      return { message: 'Email verified successfully. You can now log in.' };
    } catch (error) {
      throw new BadRequestException(`Invalid or expired token: ${error.message}`);
    }
  }

  /**
   * 로그인
   */
  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new BadRequestException('Email not verified or user not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    // JWT 토큰 생성
    const accessToken = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '10m' } // 토큰 유효기간
    );

    return { accessToken };
  }
}
