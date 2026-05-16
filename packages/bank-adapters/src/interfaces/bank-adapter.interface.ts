// Core bank adapter interface
export interface BeneficiaryDetails {
  firstName: string;
  lastName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: 'SAVINGS' | 'CURRENT';
}

export interface QuoteRequest {
  sourceAmount: number;
  sourceCurrency: string;
  targetCurrency: string;
  beneficiaryCountry: string;
}

export interface QuoteResponse {
  bankName: string;
  fxRate: number;
  markup: number;
  transferFee: number;
  gst: number;
  correspondentFee: number;
  estimatedReceive: number;
  eta: string;
  riskScore: number;
  quoteId: string;
  expiresAt: Date;
}

export interface BeneficiaryValidationRequest {
  firstName: string;
  lastName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: 'SAVINGS' | 'CURRENT';
}

export interface BeneficiaryValidationResponse {
  isValid: boolean;
  accountHolderName: string;
  accountType: string;
  bankName: string;
  riskFlags?: string[];
}

export interface PaymentInitiationRequest {
  quoteId: string;
  sourceAmount: number;
  sourceCurrency: string;
  targetCurrency: string;
  beneficiary: BeneficiaryDetails;
  reference: string;
  narration?: string;
}

export interface PaymentInitiationResponse {
  paymentId: string;
  bankReference: string;
  status: 'INITIATED' | 'PROCESSING' | 'PENDING_APPROVAL';
  estimatedDelivery: Date;
  fee: number;
}

export interface PaymentStatusRequest {
  paymentId: string;
  bankReference?: string;
}

export interface PaymentStatusResponse {
  paymentId: string;
  bankReference: string;
  status: 'INITIATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  sourceAmount: number;
  targetAmount: number;
  fee: number;
  failureReason?: string;
  updatedAt: Date;
}

export interface PaymentCancellationRequest {
  paymentId: string;
  reason: string;
}

export interface PaymentCancellationResponse {
  paymentId: string;
  status: 'CANCELLED' | 'CANCELLATION_FAILED';
  reason: string;
  cancelledAt: Date;
}

export interface IBankAdapter {
  bankName: string;

  getQuote(request: QuoteRequest): Promise<QuoteResponse>;

  validateBeneficiary(request: BeneficiaryValidationRequest): Promise<BeneficiaryValidationResponse>;

  initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResponse>;

  checkStatus(request: PaymentStatusRequest): Promise<PaymentStatusResponse>;

  cancelPayment(request: PaymentCancellationRequest): Promise<PaymentCancellationResponse>;

  healthCheck(): Promise<boolean>;
}
