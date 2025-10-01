import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class PollOption {
  @Prop({ required: true })
  text: string;

  @Prop({ default: 0 })
  votes: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  votedBy: Types.ObjectId[];
}

@Schema({ timestamps: true })
export class Poll extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [PollOption], required: true })
  options: PollOption[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isPublic: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  allowedUsers: Types.ObjectId[];

  @Prop({ required: true })
  expiresAt: Date;

  get isActive(): boolean {
    return new Date() < this.expiresAt;
  }
}

export const PollSchema = SchemaFactory.createForClass(Poll);

PollSchema.virtual('isActive').get(function (this: Poll) {
  return new Date() < this.expiresAt;
});

PollSchema.set('toJSON', { virtuals: true });
PollSchema.set('toObject', { virtuals: true });
