import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Tag extends Document {
  @Prop({ required: true, unique: true })
  name: string; // 태그 이름

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
