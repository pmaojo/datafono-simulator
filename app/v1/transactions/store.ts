import fs from 'fs';
import path from 'path';
import { Transaction } from './types';

const STORE_FILE = path.join(process.cwd(), 'transaction-store.json');

class TransactionStore {
  private transactions: Map<string, Transaction> = new Map();

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
        this.transactions = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error loading transaction store:', error);
    }
  }

  private saveToDisk() {
    try {
      const data = Object.fromEntries(this.transactions);
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving transaction store:', error);
    }
  }

  addTransaction(tx: Transaction) {
    if (!tx.orderId) {
      throw new Error('Transaction must have an orderId');
    }
    this.transactions.set(tx.orderId, tx);
    this.saveToDisk();
  }

  getTransaction(orderId: string): Transaction | undefined {
    return this.transactions.get(orderId);
  }

  getTransactions(): Map<string, Transaction> {
    return this.transactions;
  }

  getLastTransaction(): Transaction | undefined {
    let lastTx: Transaction | undefined;
    let lastTime = new Date(0);

    for (const tx of this.transactions.values()) {
      const txTime = new Date(tx.timestamp);
      if (txTime > lastTime) {
        lastTime = txTime;
        lastTx = tx;
      }
    }

    return lastTx;
  }

  updateTransaction(orderId: string, updates: Partial<Transaction>) {
    const tx = this.transactions.get(orderId);
    if (tx) {
      this.transactions.set(orderId, { ...tx, ...updates });
      this.saveToDisk();
    }
  }

  isDeviceBusy(): boolean {
    // El dispositivo está ocupado si hay alguna transacción pendiente
    for (const tx of this.transactions.values()) {
      if (tx.status === 'pending') {
        return true;
      }
    }
    return false;
  }
}

// Singleton instance
const store = new TransactionStore();

export function getTransactionStore() {
  return store;
} 