import fs from 'fs';
import path from 'path';
import { Transaction } from '../types'; // Assuming Transaction type is in ../types

const STORE_FILE = path.join(process.cwd(), 'transaction-store.json');

export class PersistenceService {
  constructor() {
    // Ensure the directory for the store file exists, if applicable (though cwd usually does)
    // For example, if STORE_FILE was in a subdirectory like data/transaction-store.json
    // const dir = path.dirname(STORE_FILE);
    // if (!fs.existsSync(dir)) {
    //   fs.mkdirSync(dir, { recursive: true });
    // }
  }

  loadTransactions(): Map<string, Transaction> {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const data = fs.readFileSync(STORE_FILE, 'utf8');
        if (data.trim() === "") { // Handle empty file case
          return new Map();
        }
        const parsedData = JSON.parse(data);
        // Ensure that the loaded data is in the expected Map format or convert it
        if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
          return new Map(Object.entries(parsedData));
        }
        // If data is not in the expected format, log an error and return an empty map
        console.error('Error loading transaction store: Data is not in the expected format.');
        return new Map();
      }
    } catch (error) {
      console.error('Error loading transaction store:', error);
    }
    return new Map(); // Return an empty map if file doesn't exist or an error occurs
  }

  saveTransactions(transactions: Map<string, Transaction>): void {
    try {
      const data = Object.fromEntries(transactions);
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving transaction store:', error);
    }
  }
}
