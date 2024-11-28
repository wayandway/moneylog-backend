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

  // 특정 태그 조회
  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagModel.findById(id).exec();
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }

  // 태그 생성
  async create(name: string): Promise<Tag> {
    if (!name) {
      throw new BadRequestException('Tag name is required');
    }

    const tagExists = await this.tagModel.exists({ name });
    if (tagExists) {
      throw new BadRequestException(`Tag '${name}' already exists`);
    }

    const newTag = new this.tagModel({ name });
    return newTag.save();
  }

  // 태그 삭제
  async delete(id: string): Promise<{ message: string }> {
    const deletedTag = await this.tagModel.findByIdAndDelete(id).exec();
    if (!deletedTag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return { message: `Tag with ID ${id} has been deleted.` };
  }
}
