import { DatafonoResponse, PaymentRequest, RefundRequest } from './types';
import { DatafonoConfig, getConfig } from './config';

export class DatafonoClient {
  private config: DatafonoConfig;
  private baseUrl: string;

  constructor(config?: Partial<DatafonoConfig>) {
    this.config = getConfig(config);
    this.baseUrl = this.buildBaseUrl();
  }

  private buildBaseUrl(): string {
    if (this.config.mode === 'simulator') {
      return `http://localhost:${this.config.port}/api/v1`;
    }
    return `${this.config.baseUrl}/api/v1`;
  }

  private get headers() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-SOURCE': 'COMERCIA'
    };

    if (this.config.key) {
      headers['X-KEY'] = this.config.key;
    }

    return headers;
  }

  private async request<T = DatafonoResponse>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: unknown
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  }

  async isAvailable() {
    return this.request('/is-available', 'POST', {});
  }

  async init(user = 'test', pass = 'test') {
    return this.request('/init', 'POST', {
      user,
      pass,
      merchantId: this.config.merchantId,
      terminalId: this.config.terminalId
    });
  }

  async payment(data: PaymentRequest) {
    return this.request('/payment', 'POST', {
      ...data,
      merchantId: this.config.merchantId,
      terminalId: this.config.terminalId,
      currency: 'EUR'
    });
  }

  async authorize(data: PaymentRequest) {
    return this.request('/authorize', 'POST', {
      ...data,
      merchantId: this.config.merchantId,
      terminalId: this.config.terminalId,
      currency: 'EUR'
    });
  }

  async refund(data: RefundRequest) {
    return this.request('/refund', 'POST', {
      ...data,
      merchantId: this.config.merchantId,
      terminalId: this.config.terminalId,
      currency: 'EUR'
    });
  }

  async getStatus(transactionId: string) {
    return this.request('/status', 'POST', {
      transactionId,
      merchantId: this.config.merchantId,
      terminalId: this.config.terminalId
    });
  }

  getConfig(): DatafonoConfig {
    return this.config;
  }
} 