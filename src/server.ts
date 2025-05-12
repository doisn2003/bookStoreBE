import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/database';
import { PaymentFactory } from './services/payment.factory';

// Routes
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import orderRoutes from './routes/order.routes';
import cartRoutes from './routes/cart.routes';
import categoryRoutes from './routes/category.routes';
import paymentRoutes from './routes/payment.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
connectDB();

// Initialize payment providers
PaymentFactory.init();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Bookstore API' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 