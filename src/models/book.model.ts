import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage: string;
  category: string;
  subCategory?: string;
  stock: number;
  isbn: string;
  publishedYear: number;
  publisher?: string;
  language?: string;
  pages?: number;
  discount?: number;
  ratings?: {
    rating: number;
    comment: string;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];
  avgRating?: number;
  // Thêm các trường để phân loại hiển thị trên frontend
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewRelease?: boolean;
  isPopular?: boolean;
  // Thêm trường để theo dõi số lượng bán
  salesCount?: number;
  // Thêm ngày phát hành chính xác
  releaseDate?: Date;
}

// Định nghĩa các danh mục sách
export enum BookCategory {
  FICTION = 'fiction',
  NON_FICTION = 'non-fiction',
  COMICS = 'comics',
  LAW = 'law',
  NOVEL = 'novel',
  EDUCATION = 'education',
  CHILDREN = 'children',
  BIOGRAPHY = 'biography',
  HISTORY = 'history',
  SCIENCE = 'science',
  TECHNOLOGY = 'technology',
  ART = 'art',
  OTHER = 'other'
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      index: true,
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
      enum: Object.values(BookCategory),
      index: true,
    },
    subCategory: {
      type: String,
      trim: true,
      index: true,
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
    publisher: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      trim: true,
      default: 'Vietnamese',
    },
    pages: {
      type: Number,
      min: 1,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    ratings: [
      {
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        comment: {
          type: String,
        },
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    avgRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    // Thêm các trường để phân loại hiển thị
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewRelease: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
      index: true,
    },
    salesCount: {
      type: Number,
      default: 0,
      index: true,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
      index: true,
    }
  },
  {
    timestamps: true,
  }
);

// Middleware to calculate average rating before saving
bookSchema.pre('save', function (next) {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, item) => sum + item.rating, 0);
    this.avgRating = totalRating / this.ratings.length;
  }
  
  // Tự động phân loại sách là mới nếu phát hành trong vòng 30 ngày
  if (this.releaseDate) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.isNewRelease = this.releaseDate >= thirtyDaysAgo;
  }
  
  next();
});

// Middleware để tự động cập nhật bestSeller dựa trên salesCount
bookSchema.pre('save', function (next) {
  if (this.isModified('salesCount') && this.salesCount) {
    // Nếu số lượng bán >= 100, đánh dấu là best seller
    this.isBestSeller = this.salesCount >= 100;
  }
  next();
});

// Create indexes for searching
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

export const Book = mongoose.model<IBook>('Book', bookSchema); 