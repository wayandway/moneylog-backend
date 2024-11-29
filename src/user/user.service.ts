import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // 모든 유저 조회
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // 특정 유저 조회 (ID 기반)
  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  // 특정 유저 조회 (userId 기반)
  async findByUserId(userId: string): Promise<User> {
    return this.userModel.findOne({ userId }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // 유저 생성
  async create(data: Partial<User>): Promise<User> {
    const newUser = new this.userModel(data);
    return newUser.save();
  }

  // 유저 수정
  async update(id: string, data: Partial<User>): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  // 유저 삭제
  async delete(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
