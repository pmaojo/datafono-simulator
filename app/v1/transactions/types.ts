export type DeviceType = 'WIFI' | 'CABLE';
export type TransactionType = 'payment' | 'preauth' | 'preauth_complete' | 'refund';

export interface Ticket {
  AID?: string;
  ARC?: string;
  ATC?: string;
  BIN?: string;
  PSN?: string;
  Amount: string;
  Authorization: string;
  CardBank: string;
  CardHolder: string;
  CardIssuer: string;
  CardNumber: string;
  CardTechnology: number;
  CardType: string;
  Currency: string;
  Date: string;
  Id: string;
  Language: string;
  Location: string;
  MerchantId: string;
  MerchantName: string;
  Modifiers: string[];
  OriginalTransactionDate?: string;
  OriginalTransactionId?: string;
  PinIndicator: number;
  SignatureIndicator: number;
  Status: string;
  Templates: string[];
  TerminalId: string;
  Time: string;
  Type: string;
}

export interface Tokenization {
  createToken?: boolean;
  codeOfUse?: string;
  customerId?: string;
  subscriptionId?: string;
  token?: string;
  tokenizerCode?: string;
}

export interface TransactionResponse {
  orderId: string;
  resultCode: number;
  resultMessage: string;
  ticket?: Ticket;
  tokenization?: Tokenization;
  deviceType?: DeviceType;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  cardType?: string;
  cardNumber?: string;
  authCode?: string;
  reference?: string;
  errorCode?: string;
  errorMessage?: string;
  timestamp: string;
  orderId?: string;
  resultCode: number;
  resultMessage?: string;
  transactionId?: string;
  ticket?: Ticket;
  tokenization?: Tokenization;
  deviceType: DeviceType;
  processingTime?: number;
  processingEndTime?: string;
  type?: TransactionType;
}

export interface InitRequest {
  user: string;
  pass?: string;
  password?: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  description?: string;
  tokenization?: Tokenization;
  deviceType?: DeviceType;
} 