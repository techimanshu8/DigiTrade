export interface BankQuote {
  bankName: string;
  fxRate: number;
  markup: number;
  transferFee: number;
  gst: number;
  correspondentFee: number;
  eta: string;
  riskScore: number;
}

export interface BankAdapterResponse {
  sourceAmount: number;
  sourceCurrency: string;
  targetCurrency: string;
  quotes: BankQuote[];
}

export interface IBankAdapter {
  fetchQuote(
    sourceAmount: number,
    sourceCurrency: string,
    targetCurrency: string,
  ): Promise<BankQuote>;
}
