// import fs from 'fs'; // No longer used directly
// import path from 'path'; // No longer used directly
import { Transaction } from './types';
import { PersistenceService } from './services/persistenceService'; // Adjust path as needed

// const STORE_FILE = path.join(process.cwd(), 'transaction-store.json'); // Moved to PersistenceService

export class TransactionStore {
  private transactions: Map<string, Transaction> = new Map();
  private persistenceService: PersistenceService;

  constructor(persistenceService: PersistenceService) {
    this.persistenceService = persistenceService;
    this.loadInitialTransactions();
  }

  private loadInitialTransactions() {
    this.transactions = this.persistenceService.loadTransactions();
  }

  private saveAllTransactions() {
    this.persistenceService.saveTransactions(this.transactions);
  }

  addTransaction(tx: Transaction) {
    if (!tx.orderId) {
      throw new Error('Transaction must have an orderId');
    }
    this.transactions.set(tx.orderId, tx);
    this.saveAllTransactions(); // Use the new save method
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
      this.saveAllTransactions(); // Use the new save method
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
const persistenceService = new PersistenceService(); // Or however it's best to create/get it
const store = new TransactionStore(persistenceService);

export function getTransactionStore() {
  return store;
}