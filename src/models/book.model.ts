import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  discount?: number;
  rating?: number;
  language?: string;
  pages?: number;
  publisher?: string;
  publishedDate?: string;
  // Giữ lại các trường cần thiết khác
  stock?: number;
  isbn?: string;
  subCategory?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewRelease?: boolean;
  isPopular?: boolean;
  salesCount?: number;
}

// Định nghĩa các danh mục sách dựa trên books_database.json
export enum BookCategory {
  FICTION = 'Fiction',
  NON_FICTION = 'Non-Fiction',
  SCIENCE_FICTION = 'Science Fiction',
  BIOGRAPHY = 'Biography',
  COMICS = 'Comics',
  LAW = 'Law',
  NOVEL = 'Novel',
  EDUCATION = 'Education',
  CHILDREN = 'Children',
  HISTORY = 'History',
  SCIENCE = 'Science',
  TECHNOLOGY = 'Technology',
  ART = 'Art',
  OTHER = 'Other'
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
    imageUrl: {
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
      min: 0,
      default: 0,
    },
    isbn: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    publisher: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      trim: true,
      default: 'English',
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
    publishedDate: {
      type: String,
      trim: true,
    },
    // Giữ lại các trường phân loại hiển thị
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
    }
  },
  {
    timestamps: true,
  }
);

// Middleware để tự động cập nhật bestSeller dựa trên salesCount
bookSchema.pre('save', function (next) {
  if (this.isModified('salesCount') && this.salesCount) {
    // Nếu số lượng bán >= 100, đánh dấu là best seller
    this.isBestSeller = this.salesCount >= 100;
  }
  
  // Tự động phân loại sách là mới nếu được thêm vào gần đây
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Kiểm tra nếu là document mới
  if (this.isNew) {
    this.isNewRelease = true;
  } else {
    // Đơn giản hóa kiểm tra ngày
    this.isNewRelease = false;
  }
  
  next();
});

// Create indexes for searching
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

export const Book = mongoose.model<IBook>('Book', bookSchema); 