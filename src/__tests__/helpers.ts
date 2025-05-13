import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export const generateTestToken = (user: any) => {
  return jwt.sign(
    { _id: user._id },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
};

export const createTestUser = async () => {
  const user = new User({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });
  await user.save();
  return user;
};
