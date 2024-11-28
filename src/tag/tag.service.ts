import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag } from './schemas/tag.schema';

@Injectable()
export class TagService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<Tag>) {}

  // 모든 태그 조회
  async findAll(): Promise<Tag[]> {
    return this.tagModel.find().exec();
  }

  // 특정 태그 조회 (태그명 기반)
  async findByName(name: string): Promise<Tag> {
    const tag = await this.tagModel.findOne({ name }).exec();
    if (!tag) {
      throw new NotFoundException(`Tag with name '${name}' not found`);
    }
    return tag;
  }

  // 태그 생성
  async create(name: string): Promise<Tag> {
    if (!name || name.length < 2 || name.length > 30) {
      throw new BadRequestException('Tag name must be between 2 and 30 characters');
    }

    const existingTag = await this.tagModel.findOne({ name }).exec();
    if (existingTag) {
      return existingTag; // 이미 존재하는 태그 반환
    }

    const newTag = new this.tagModel({ name });
    return newTag.save();
  }

  // 태그 삭제 (태그명 기반)
  async delete(name: string): Promise<{ message: string }> {
    const deletedTag = await this.tagModel.findOneAndDelete({ name }).exec();
    if (!deletedTag) {
      throw new NotFoundException(`Tag with name '${name}' not found`);
    }
    return { message: `Tag '${name}' has been deleted.` };
  }
}
