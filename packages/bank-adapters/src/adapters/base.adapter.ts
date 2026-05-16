import { v4 as uuidv4 } from 'uuid';
import {
  IBankAdapter,
  BeneficiaryValidationRequest,
  BeneficiaryValidationResponse,
  QuoteRequest,
  QuoteResponse,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentStatusRequest,
  PaymentStatusResponse,
  PaymentCancellationRequest,
  PaymentCancellationResponse,
} from '../interfaces/bank-adapter.interface';

export abstract class BaseBankAdapter implements IBankAdapter {
  abstract bankName: string;
  protected simulatedPayments: Map<string, PaymentStatusResponse> = new Map();

  abstract getQuote(request: QuoteRequest): Promise<QuoteResponse>;

  abstract validateBeneficiary(
    request: BeneficiaryValidationRequest,
  ): Promise<BeneficiaryValidationResponse>;

  initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    const paymentId = uuidv4();
    const bankReference = `${this.bankName.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);

    // Store payment state for status checks
    this.simulatedPayments.set(paymentId, {
      paymentId,
      bankReference,
      status: 'PROCESSING',
      sourceAmount: request.sourceAmount,
      targetAmount: request.sourceAmount * 83.45, // Mock conversion
      fee: request.sourceAmount * 0.001,
      updatedAt: new Date(),
    });

    return Promise.resolve({
      paymentId,
      bankReference,
      status: 'PROCESSING',
      estimatedDelivery,
      fee: request.sourceAmount * 0.001,
    });
  }

  checkStatus(request: PaymentStatusRequest): Promise<PaymentStatusResponse> {
    const payment = this.simulatedPayments.get(request.paymentId);

    if (!payment) {
      return Promise.resolve({
        paymentId: request.paymentId,
        bankReference: request.bankReference || 'UNKNOWN',
        status: 'FAILED',
        sourceAmount: 0,
        targetAmount: 0,
        fee: 0,
        failureReason: 'Payment not found',
        updatedAt: new Date(),
      });
    }

    // Simulate progress: PROCESSING -> COMPLETED after 1 minute
    const createdTime = payment.updatedAt.getTime();
    const elapsedTime = Date.now() - createdTime;

    if (elapsedTime > 60000 && payment.status === 'PROCESSING') {
      payment.status = 'COMPLETED';
    }

    return Promise.resolve(payment);
  }

  cancelPayment(request: PaymentCancellationRequest): Promise<PaymentCancellationResponse> {
    const payment = this.simulatedPayments.get(request.paymentId);

    if (!payment || payment.status === 'COMPLETED') {
      return Promise.resolve({
        paymentId: request.paymentId,
        status: 'CANCELLATION_FAILED',
        reason: 'Cannot cancel completed or non-existent payment',
        cancelledAt: new Date(),
      });
    }

    payment.status = 'CANCELLED';

    return Promise.resolve({
      paymentId: request.paymentId,
      status: 'CANCELLED',
      reason: request.reason,
      cancelledAt: new Date(),
    });
  }

  async healthCheck(): Promise<boolean> {
    // Mock implementation - always returns true
    return Promise.resolve(true);
  }
}
