import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
  createdBy: mongoose.Types.ObjectId;
  familyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    amount: {
      type: Number,
      required: [true, 'Сумма обязательна'],
    },
    description: {
      type: String,
      required: [true, 'Описание обязательно'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Категория обязательна'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Тип транзакции обязателен'],
    },
    date: {
      type: Date,
      required: [true, 'Дата обязательна'],
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    familyId: {
      type: Schema.Types.ObjectId,
      ref: 'Family',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction; 