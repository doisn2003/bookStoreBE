const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Đường dẫn đến file model Book đã được biên dịch
const BookModel = require('../dist/models/book.model');

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối tới MongoDB'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Đọc file JSON
const jsonPath = path.join(__dirname, '../books_database.json');
console.log('Đường dẫn đến file JSON:', jsonPath);
const booksData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log(`Đã đọc ${booksData.length} sách từ file JSON`);

// Biến đổi dữ liệu
const transformedBooks = booksData.map(book => ({
  title: book.title,
  author: book.author,
  description: book.description,
  price: book.price,
  imageUrl: book.imageUrl,
  category: book.category,
  language: book.language || 'English',
  pages: book.pages,
  publisher: book.publisher,
  publishedDate: book.publishedDate,
  discount: book.discount || 0,
  rating: book.rating || 0,
  stock: 100, // Mặc định số lượng hàng
  isbn: book.id, // Dùng id làm isbn tạm thời
  isFeatured: Math.random() > 0.5, // Random flag
  isBestSeller: Math.random() > 0.7,
  isNewRelease: Math.random() > 0.7,
  isPopular: Math.random() > 0.6,
  salesCount: Math.floor(Math.random() * 200) // Random số lượng bán
}));

// Import vào database
async function importBooks() {
  try {
    // Lấy model Book từ module đã biên dịch
    const Book = BookModel.Book;
    
    if (!Book) {
      console.error('Không tìm thấy model Book');
      process.exit(1);
    }
    
    // Xóa dữ liệu cũ
    await Book.deleteMany({});
    console.log('Đã xóa tất cả sách cũ');
    
    // Import dữ liệu mới
    const insertedBooks = await Book.insertMany(transformedBooks);
    console.log(`Đã import thành công ${insertedBooks.length} sách`);
    
    // Đóng kết nối
    mongoose.connection.close();
  } catch (error) {
    console.error('Lỗi khi import sách:', error);
    console.error(error.stack);
    mongoose.connection.close();
    process.exit(1);
  }
}

importBooks();