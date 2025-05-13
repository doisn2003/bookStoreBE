import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

// Routes
import authRoutes from './routes/auth.routes';
import nftRoutes from './routes/nft.routes';
import bookRoutes from './routes/book.routes';
import orderRoutes from './routes/order.routes';
import categoryRoutes from './routes/category.routes';


dotenv.config();

export const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nftshop')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/nfts', nftRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);


// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Only start the server if this file is run directly
if (require.main === module) {
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
} 