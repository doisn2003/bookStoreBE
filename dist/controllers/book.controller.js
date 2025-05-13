"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooksByCategory = exports.getPopularBooks = exports.getNewReleaseBooks = exports.getBestSellerBooks = exports.getFeaturedBooks = exports.getBookCategories = exports.searchBooks = exports.deleteBook = exports.updateBook = exports.getBook = exports.getBooks = exports.createBook = void 0;
const express_validator_1 = require("express-validator");
const book_model_1 = require("../models/book.model");
// Create a new book
const createBook = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const book = new book_model_1.Book(req.body);
        await book.save();
        res.status(201).json(book);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
    }
};
exports.createBook = createBook;
// Get all books with pagination and advanced filtering
const getBooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const filter = {};
        // Áp dụng các bộ lọc
        if (req.query.category) {
            filter.category = req.query.category;
        }
        if (req.query.subCategory) {
            filter.subCategory = req.query.subCategory;
        }
        if (req.query.author) {
            filter.author = { $regex: req.query.author, $options: 'i' };
        }
        if (req.query.publisher) {
            filter.publisher = { $regex: req.query.publisher, $options: 'i' };
        }
        if (req.query.language) {
            filter.language = req.query.language;
        }
        // Lọc theo khoảng giá
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice)
                filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice)
                filter.price.$lte = Number(req.query.maxPrice);
        }
        // Lọc theo khoảng năm xuất bản
        if (req.query.minYear || req.query.maxYear) {
            filter.publishedYear = {};
            if (req.query.minYear)
                filter.publishedYear.$gte = Number(req.query.minYear);
            if (req.query.maxYear)
                filter.publishedYear.$lte = Number(req.query.maxYear);
        }
        // Lọc theo rating
        if (req.query.minRating) {
            filter.rating = { $gte: Number(req.query.minRating) };
        }
        // Lọc theo các trạng thái đặc biệt
        if (req.query.isFeatured === 'true') {
            filter.isFeatured = true;
        }
        if (req.query.isBestSeller === 'true') {
            filter.isBestSeller = true;
        }
        if (req.query.isNewRelease === 'true') {
            filter.isNewRelease = true;
        }
        if (req.query.isPopular === 'true') {
            filter.isPopular = true;
        }
        if (req.query.inStock === 'true') {
            filter.stock = { $gt: 0 };
        }
        // Lọc theo phạm vi ngày phát hành
        if (req.query.fromDate || req.query.toDate) {
            filter.releaseDate = {};
            if (req.query.fromDate)
                filter.releaseDate.$gte = new Date(req.query.fromDate);
            if (req.query.toDate)
                filter.releaseDate.$lte = new Date(req.query.toDate);
        }
        const sortOptions = {};
        sortOptions[sortField] = sortOrder;
        const books = await book_model_1.Book.find(filter)
            .skip(skip)
            .limit(limit)
            .sort(sortOptions);
        const total = await book_model_1.Book.countDocuments(filter);
        res.json({
            books,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalBooks: total,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
    }
};
exports.getBooks = getBooks;
// Get single book
const getBook = async (req, res) => {
    try {
        const book = await book_model_1.Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Không tìm thấy sách' });
        }
        res.json(book);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
    }
};
exports.getBook = getBook;
// Update book
const updateBook = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const book = await book_model_1.Book.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!book) {
            return res.status(404).json({ message: 'Không tìm thấy sách' });
        }
        res.json(book);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
    }
};
exports.updateBook = updateBook;
// Delete book
const deleteBook = async (req, res) => {
    try {
        const book = await book_model_1.Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Không tìm thấy sách' });
        }
        res.json({ message: 'Xóa sách thành công' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
    }
};
exports.deleteBook = deleteBook;
// Search books
const searchBooks = async (req, res) => {
    try {
        const { query } = req.query;
        let searchQuery = {};
        if (query) {
            searchQuery = { $text: { $search: query } };
        }
        const books = await book_model_1.Book.find(searchQuery)
            .sort({ score: { $meta: 'textScore' } });
        res.json(books);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
    }
};
exports.searchBooks = searchBooks;
// Get book categories
const getBookCategories = async (req, res) => {
    try {
        const categories = Object.values(book_model_1.BookCategory);
        res.json(categories);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
    }
};
exports.getBookCategories = getBookCategories;
// Get featured books
const getFeaturedBooks = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const books = await book_model_1.Book.find({ isFeatured: true })
            .limit(limit)
            .sort({ createdAt: -1 });
        res.json(books);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
    }
};
exports.getFeaturedBooks = getFeaturedBooks;
// Get best seller books
const getBestSellerBooks = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const books = await book_model_1.Book.find({ isBestSeller: true })
            .limit(limit)
            .sort({ salesCount: -1 });
        res.json(books);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
    }
};
exports.getBestSellerBooks = getBestSellerBooks;
// Get new release books
const getNewReleaseBooks = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const books = await book_model_1.Book.find({ isNewRelease: true })
            .limit(limit)
            .sort({ createdAt: -1 });
        res.json(books);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
    }
};
exports.getNewReleaseBooks = getNewReleaseBooks;
// Get popular books
const getPopularBooks = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const books = await book_model_1.Book.find({ isPopular: true })
            .limit(limit)
            .sort({ rating: -1 });
        res.json(books);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
    }
};
exports.getPopularBooks = getPopularBooks;
// Get books by category
const getBooksByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const limit = parseInt(req.query.limit) || 8;
        const books = await book_model_1.Book.find({ category })
            .limit(limit)
            .sort({ createdAt: -1 });
        res.json(books);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
    }
};
exports.getBooksByCategory = getBooksByCategory;
