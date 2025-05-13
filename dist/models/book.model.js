"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = exports.BookCategory = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Định nghĩa các danh mục sách dựa trên books_database.json
var BookCategory;
(function (BookCategory) {
    BookCategory["FICTION"] = "Fiction";
    BookCategory["NON_FICTION"] = "Non-Fiction";
    BookCategory["SCIENCE_FICTION"] = "Science Fiction";
    BookCategory["BIOGRAPHY"] = "Biography";
    BookCategory["COMICS"] = "Comics";
    BookCategory["LAW"] = "Law";
    BookCategory["NOVEL"] = "Novel";
    BookCategory["EDUCATION"] = "Education";
    BookCategory["CHILDREN"] = "Children";
    BookCategory["HISTORY"] = "History";
    BookCategory["SCIENCE"] = "Science";
    BookCategory["TECHNOLOGY"] = "Technology";
    BookCategory["ART"] = "Art";
    BookCategory["OTHER"] = "Other";
})(BookCategory || (exports.BookCategory = BookCategory = {}));
const bookSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
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
    }
    else {
        // Đơn giản hóa kiểm tra ngày
        this.isNewRelease = false;
    }
    next();
});
// Create indexes for searching
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
exports.Book = mongoose_1.default.model('Book', bookSchema);
