import mongoose, { Document, Schema } from 'mongoose';
/*
Quản lý 3 phương thức thanh toán
1. Thanh toán khi nhận hàng
2. Thanh toán chuyển khoản
3. Thanh toán bằng Ethereum
*/
export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: 'cash_on_delivery' | 'bank_transfer' | 'ethereum';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    transferDate?: Date;
    referenceCode?: string;
  };
  paymentDate?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'VND',
    },
    method: {
      type: String,
      enum: ['cash_on_delivery', 'bank_transfer', 'ethereum'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      required: true,
    },
    transactionId: {
      type: String,
    },
    bankDetails: {
      bankName: {
        type: String,
      },
      accountNumber: {
        type: String,
      },
      transferDate: {
        type: Date,
      },
      referenceCode: {
        type: String,
      },
    },
    paymentDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema); 