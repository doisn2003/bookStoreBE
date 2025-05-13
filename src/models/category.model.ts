import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  slug: string;
  image?: string;
  parentCategory?: mongoose.Types.ObjectId;
  isSubCategory: boolean;
  isActive: boolean;
  displayOrder?: number;
  featuredBooks?: mongoose.Types.ObjectId[];
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    isSubCategory: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    featuredBooks: [{
      type: Schema.Types.ObjectId,
      ref: 'Book',
    }]
  },
  {
    timestamps: true,
  }
);

// Tạo index để tìm kiếm danh mục
categorySchema.index({ name: 'text', description: 'text' });
categorySchema.index({ slug: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema); 