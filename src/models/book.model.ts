import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage: string;
  category: string;
  stock: number;
  isbn: string;
  publishedYear: number;
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    coverImage: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    publishedYear: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Book = mongoose.model<IBook>('Book', bookSchema); 