import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'parent' | 'child' | 'personal' | 'boyfriend' | 'girlfriend';
  avatar?: string;
  familyId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  points: number;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Имя обязательно'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email обязателен'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Пароль обязателен'],
      minlength: [6, 'Пароль должен содержать минимум 6 символов'],
    },
    role: {
      type: String,
      enum: ['admin', 'parent', 'child', 'personal', 'boyfriend', 'girlfriend'],
      default: 'personal',
    },
    avatar: {
      type: String,
    },
    familyId: {
      type: Schema.Types.ObjectId,
      ref: 'Family',
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User; 