const PORTS = {
  CABLE: {
    dev: 2001,
    prod: 2010
  },
  WIFI: {
    dev: 2002,
    prod: 2011
  }
};

const isProd = process.env.NODE_ENV === 'production';

export class DatafonoTestClient {
  private baseUrl: string;
  private headers = {
    'Content-Type': 'application/json',
    'X-SOURCE': 'COMERCIA'
  };

  constructor(type: 'CABLE' | 'WIFI' = 'WIFI') {
    const port = PORTS[type][isProd ? 'prod' : 'dev'];
    this.baseUrl = `http://localhost:${port}/api/v1`;
  }

  async isAvailable() {
    const response = await fetch(`${this.baseUrl}/is-available`, {
      method: 'POST',
      headers: this.headers
    });
    return response.json();
  }

  async init(user = 'test', pass = 'test') {
    const response = await fetch(`${this.baseUrl}/init`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ user, pass })
    });
    return response.json();
  }

  async payment(amount: number, orderId: string, description = '') {
    const response = await fetch(`${this.baseUrl}/payment`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ amount, orderId, description })
    });
    return response.json();
  }

  async authorize(amount: number, orderId: string, description = '') {
    const response = await fetch(`${this.baseUrl}/authorize`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ amount, orderId, description })
    });
    return response.json();
  }

  async rebate(transactionId: string, amount: number, orderId: string, description = '') {
    const response = await fetch(`${this.baseUrl}/rebate`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        transactionId,
        amount,
        orderId,
        description
      })
    });
    return response.json();
  }

  async getLastTransaction() {
    const response = await fetch(`${this.baseUrl}/last-transaction`, {
      method: 'GET',
      headers: this.headers
    });
    return response.json();
  }

  async waitForTransactionComplete(timeoutMs = 5000): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const result = await this.getLastTransaction();
      if (result.resultCode !== 1001) {
        return result;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    throw new Error('Transaction timeout');
  }
} 