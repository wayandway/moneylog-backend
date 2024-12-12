import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transform } from 'class-transformer';

@Schema({ timestamps: true, versionKey: false })
export class User extends Document {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: true,
    unique: true,
    validate: /^[a-z]+$/,
  })
  userDomain: string; // 블로그 도메인
}

export const UserSchema = SchemaFactory.createForClass(User);
