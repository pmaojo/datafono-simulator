export type DatafonoType = 'STAGING' | 'PRODUCTION';

export interface Tokenization {
  createToken?: boolean;
  codeOfUse?: string;
  customerId?: string;
  subscriptionId?: string;
  token?: string;
  tokenizerCode?: string;
}

export interface Ticket {
  AID?: string;
  ARC?: string;
  ATC?: string;
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

export interface DatafonoResponse {
  resultCode: number;
  resultMessage: string;
  orderId?: string;
  transactionId?: string;
  ticket?: Ticket;
  tokenization?: Tokenization;
}

export interface PaymentRequest {
  amount: number;
  orderId: string;
  description?: string;
  tokenization?: Tokenization;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  orderId?: string;
  description?: string;
  tokenization?: Tokenization;
}

export const PORTS = {
  STAGING: 2002,
  PRODUCTION: 2011
} as const;

export const RESULT_CODES = {
  SUCCESS: 0,
  BUSY: 1001,
  INIT_SUCCESS: 1000,
  DECLINED: 105,
  REFUND_DECLINED: 950,
  NOT_FOUND: 602,
  INVALID_PARAMS: 2,
  INVALID_SOURCE: 1010,
  NETWORK_ERROR: 25,
  DEVICE_ERROR: 21,
  TIMEOUT: 17
} as const;

export const TIMEOUTS = {
  CABLE: 30000,
  WIFI: 60000
} as const; 