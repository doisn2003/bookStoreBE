import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: 'cash_on_delivery' | 'bank_transfer' | 'ethereum';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
  paymentDate: Date;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    transferDate?: Date;
    referenceCode?: string;
  };
  ethereumDetails?: {
    address?: string;
    transactionHash?: string;
  };
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
      required: true,
      unique: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
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
    ethereumDetails: {
      address: {
        type: String,
      },
      transactionHash: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Tạo index cho tìm kiếm nhanh
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema); 