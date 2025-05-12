import { Request, Response } from 'express';
import { Category } from '../models/category.model';
import { Book } from '../models/book.model';
import mongoose from 'mongoose';

// Tạo một danh mục mới
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image, parentCategory, isSubCategory } = req.body;

    // Tạo slug từ tên danh mục
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Kiểm tra danh mục có tồn tại không
    const existingCategory = await Category.findOne({ 
      $or: [{ name }, { slug }] 
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Danh mục đã tồn tại' });
    }

    let newCategory = new Category({
      name,
      description,
      slug,
      image,
      isSubCategory: isSubCategory || false,
    });

    // Nếu là danh mục con, kiểm tra danh mục cha
    if (parentCategory && mongoose.Types.ObjectId.isValid(parentCategory)) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục cha' });
      }
      newCategory.parentCategory = parent._id;
      newCategory.isSubCategory = true;
    }

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error: any) {
    console.error('Create category error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Lấy tất cả danh mục
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .populate('parentCategory', 'name slug');

    res.json(categories);
  } catch (error: any) {
    console.error('Get all categories error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Lấy danh mục chính (không phải danh mục con)
export const getMainCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ 
      isSubCategory: false,
      isActive: true 
    }).sort({ displayOrder: 1, name: 1 });

    res.json(categories);
  } catch (error: any) {
    console.error('Get main categories error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Lấy danh mục con của một danh mục
export const getSubCategories = async (req: Request, res: Response) => {
  try {
    const { parentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ message: 'ID danh mục không hợp lệ' });
    }

    const categories = await Category.find({ 
      parentCategory: parentId,
      isActive: true 
    }).sort({ displayOrder: 1, name: 1 });

    res.json(categories);
  } catch (error: any) {
    console.error('Get sub categories error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Lấy thông tin danh mục theo ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID danh mục không hợp lệ' });
    }

    const category = await Category.findById(id).populate('parentCategory', 'name slug');
    
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    res.json(category);
  } catch (error: any) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Lấy thông tin danh mục theo slug
export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const category = await Category.findOne({ slug }).populate('parentCategory', 'name slug');
    
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    res.json(category);
  } catch (error: any) {
    console.error('Get category by slug error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Cập nhật danh mục
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, image, parentCategory, isActive, displayOrder, featuredBooks } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID danh mục không hợp lệ' });
    }

    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    // Cập nhật thông tin danh mục
    if (name) {
      category.name = name;
      // Cập nhật slug nếu tên thay đổi
      category.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;

    // Cập nhật danh mục cha nếu có
    if (parentCategory) {
      if (mongoose.Types.ObjectId.isValid(parentCategory)) {
        const parent = await Category.findById(parentCategory);
        if (!parent) {
          return res.status(404).json({ message: 'Không tìm thấy danh mục cha' });
        }
        category.parentCategory = parent._id;
        category.isSubCategory = true;
      } else if (parentCategory === null) {
        // Nếu parentCategory là null, bỏ danh mục cha
        category.parentCategory = undefined;
        category.isSubCategory = false;
      }
    }

    // Cập nhật sách nổi bật trong danh mục
    if (featuredBooks && Array.isArray(featuredBooks)) {
      const validBookIds = [];
      
      for (const bookId of featuredBooks) {
        if (mongoose.Types.ObjectId.isValid(bookId)) {
          const book = await Book.findById(bookId);
          if (book) {
            validBookIds.push(book._id);
          }
        }
      }
      
      category.featuredBooks = validBookIds;
    }

    await category.save();
    res.json(category);
  } catch (error: any) {
    console.error('Update category error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Xóa danh mục
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID danh mục không hợp lệ' });
    }

    // Kiểm tra xem có danh mục con không
    const hasSubcategories = await Category.exists({ parentCategory: id });
    if (hasSubcategories) {
      return res.status(400).json({ 
        message: 'Không thể xóa danh mục này vì có danh mục con. Hãy xóa danh mục con trước.' 
      });
    }

    // Kiểm tra xem có sách nào thuộc danh mục này không
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    // Xóa danh mục
    await Category.findByIdAndDelete(id);
    
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Lấy sách theo danh mục
export const getBooksByCategory = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Tìm danh mục theo slug
    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    // Tìm tất cả danh mục con
    let categoryIds = [category._id];
    
    if (!category.isSubCategory) {
      const subCategories = await Category.find({ parentCategory: category._id });
      categoryIds = [...categoryIds, ...subCategories.map(cat => cat._id)];
    }
    
    // Tìm sách thuộc danh mục và danh mục con
    const books = await Book.find({ category: category.name })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalBooks = await Book.countDocuments({ category: category.name });

    res.json({
      category,
      books,
      currentPage: page,
      totalPages: Math.ceil(totalBooks / limit),
      totalBooks,
    });
  } catch (error: any) {
    console.error('Get books by category error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Lấy danh mục phổ biến (có nhiều sách nhất)
export const getPopularCategories = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    
    // Lấy tất cả sách và đếm theo danh mục
    const categoryCounts = await Book.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
    
    // Lấy thông tin danh mục
    const categoryNames = categoryCounts.map(c => c._id);
    const categories = await Category.find({ name: { $in: categoryNames } });
    
    // Kết hợp số lượng với thông tin danh mục
    const result = categories.map(cat => {
      const countInfo = categoryCounts.find(c => c._id === cat.name);
      return {
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        bookCount: countInfo ? countInfo.count : 0
      };
    }).sort((a, b) => b.bookCount - a.bookCount);
    
    res.json(result);
  } catch (error: any) {
    console.error('Get popular categories error:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
}; 