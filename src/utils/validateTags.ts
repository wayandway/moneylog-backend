import { Model } from 'mongoose';
import { Tag } from '../tag/schemas/tag.schema';

export async function validateTags(tagNames: string[], tagModel: Model<Tag>): Promise<string[]> {
  const validatedTags: string[] = await Promise.all(
    tagNames.map(async tagName => {
      const existingTag = await tagModel.findOne({ name: tagName }).exec();
      if (!existingTag) {
        // 태그가 없으면 새로 생성
        const newTag = await tagModel.create({ name: tagName });
        return newTag.name;
      }
      return existingTag.name;
    })
  );
  return validatedTags;
}
