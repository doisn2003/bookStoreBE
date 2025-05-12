import { Request, Response } from 'express';
import { IPaymentProvider } from './payment.interface';
import { CashOnDeliveryProvider } from './payment.providers/cash-on-delivery.provider';
import { BankTransferProvider } from './payment.providers/bank-transfer.provider';

/**
 * Factory class to create and manage payment providers
 */
export class PaymentFactory {
  private static providers: Map<string, IPaymentProvider> = new Map();

  /**
   * Initialize all payment providers
   */
  static init(): void {
    // Register payment providers
    this.registerProvider('cash_on_delivery', new CashOnDeliveryProvider());
    this.registerProvider('bank_transfer', new BankTransferProvider());
    // Ethereum provider will be added later
  }

  /**
   * Register a payment provider
   * @param method - Payment method name
   * @param provider - Payment provider instance
   */
  static registerProvider(method: string, provider: IPaymentProvider): void {
    this.providers.set(method, provider);
  }

  /**
   * Get a payment provider by method
   * @param method - Payment method name
   * @returns Payment provider
   */
  static getProvider(method: string): IPaymentProvider | undefined {
    return this.providers.get(method);
  }

  /**
   * Get all available payment methods
   * @returns List of payment methods
   */
  static getAvailablePaymentMethods(): Array<{
    code: string;
    name: string;
    description: string;
    isActive: boolean;
    requiresRedirect: boolean;
  }> {
    const methods = [];
    
    for (const [code, provider] of this.providers.entries()) {
      const info = provider.getPaymentInfo();
      methods.push({
        code,
        ...info,
      });
    }
    
    return methods;
  }

  /**
   * Process a payment using the appropriate provider
   * @param method - Payment method
   * @param req - Express request
   * @param res - Express response
   */
  static async processPayment(method: string, req: Request, res: Response): Promise<void> {
    const provider = this.getProvider(method);
    
    if (!provider) {
      res.status(400).json({
        success: false,
        message: `Phương thức thanh toán '${method}' không được hỗ trợ`,
      });
      return;
    }
    
    await provider.processPayment(req, res);
  }

  /**
   * Verify a payment using the appropriate provider
   * @param method - Payment method
   * @param req - Express request
   * @param res - Express response
   */
  static async verifyPayment(method: string, req: Request, res: Response): Promise<void> {
    const provider = this.getProvider(method);
    
    if (!provider) {
      res.status(400).json({
        success: false,
        message: `Phương thức thanh toán '${method}' không được hỗ trợ`,
      });
      return;
    }
    
    await provider.verifyPayment(req, res);
  }

  /**
   * Refund a payment using the appropriate provider
   * @param method - Payment method
   * @param req - Express request
   * @param res - Express response
   */
  static async refundPayment(method: string, req: Request, res: Response): Promise<void> {
    const provider = this.getProvider(method);
    
    if (!provider) {
      res.status(400).json({
        success: false,
        message: `Phương thức thanh toán '${method}' không được hỗ trợ`,
      });
      return;
    }
    
    await provider.refundPayment(req, res);
  }
} 