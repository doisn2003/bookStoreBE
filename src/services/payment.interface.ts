import { Request, Response } from 'express';

/**
 * Interface for all payment providers
 */
export interface IPaymentProvider {
  /**
   * Process a payment
   * @param req - Express request
   * @param res - Express response
   */
  processPayment(req: Request, res: Response): Promise<void>;

  /**
   * Verify a payment
   * @param req - Express request
   * @param res - Express response
   */
  verifyPayment(req: Request, res: Response): Promise<void>;

  /**
   * Refund a payment
   * @param req - Express request
   * @param res - Express response
   */
  refundPayment(req: Request, res: Response): Promise<void>;

  /**
   * Get payment method information
   * @returns Payment method info
   */
  getPaymentInfo(): {
    name: string;
    description: string;
    isActive: boolean;
    requiresRedirect: boolean;
  };
}

/**
 * Cash on Delivery payment structure
 */
export interface ICashOnDeliveryPayment {
  orderId: string;
  amount: number;
  currency: string;
  customerInfo?: {
    name: string;
    phone: string;
    address: string;
  };
}

/**
 * Bank Transfer payment structure
 */
export interface IBankTransferPayment {
  orderId: string;
  amount: number;
  currency: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountHolderName?: string;
    transferDate?: Date;
    referenceCode?: string;
  };
}

/**
 * Ethereum payment structure (to be implemented later)
 */
export interface IEthereumPayment {
  orderId: string;
  amount: number;
  currency: string;
  walletAddress: string;
  transactionHash?: string;
}

/**
 * Payment response structure
 */
export interface IPaymentResponse {
  success: boolean;
  message: string;
  paymentId?: string;
  transactionId?: string;
  status?: string;
  redirectUrl?: string;
} 