import { TransactionStore } from '../../app/v1/transactions/store'; // Adjust path
import { PersistenceService } from '../../app/v1/transactions/services/persistenceService'; // Adjust path
import { Transaction, TransactionStatus } from '../../app/v1/transactions/types'; // Adjust path
import { STATUS } from '../../app/v1/transactions/constants'; // Adjust path

jest.mock('../../app/v1/transactions/services/persistenceService'); // Mock the service

describe('TransactionStore', () => {
  let store: TransactionStore;
  let mockPersistenceService: jest.Mocked<PersistenceService>;

  const sampleTx1: Transaction = {
    id: 'TX001',
    orderId: 'ORDER001',
    amount: 100,
    currency: 'EUR',
    status: STATUS.PENDING as TransactionStatus,
    resultCode: 1001,
    resultMessage: 'Pending',
    timestamp: new Date('2023-01-01T10:00:00.000Z').toISOString(),
    deviceType: 'WIFI',
    processingTime: 2000,
    processingEndTime: new Date('2023-01-01T10:00:02.000Z').toISOString(),
  };

  const sampleTx2: Transaction = {
    id: 'TX002',
    orderId: 'ORDER002',
    amount: 200,
    currency: 'EUR',
    status: STATUS.APPROVED as TransactionStatus,
    resultCode: 0,
    resultMessage: 'Approved',
    timestamp: new Date('2023-01-01T11:00:00.000Z').toISOString(), // Later timestamp
    deviceType: 'CABLE',
    processingTime: 1000,
    processingEndTime: new Date('2023-01-01T11:00:01.000Z').toISOString(),
  };
  
  const sampleTx3WithoutOrderId = { ...sampleTx1, orderId: undefined as any };


  beforeEach(() => {
    // Create a fresh mock for each test
    mockPersistenceService = new PersistenceService() as jest.Mocked<PersistenceService>;
    
    // Provide mock implementations for loadTransactions and saveTransactions
    // For loadTransactions, we can return a new Map with copies of sample transactions if needed for specific tests
    mockPersistenceService.loadTransactions = jest.fn().mockReturnValue(new Map());
    mockPersistenceService.saveTransactions = jest.fn();
            
    store = new TransactionStore(mockPersistenceService);
  });

  describe('Constructor', () => {
    it('should call loadTransactions on the persistence service upon initialization', () => {
      expect(mockPersistenceService.loadTransactions).toHaveBeenCalledTimes(1);
    });

    it('should initialize with transactions loaded from persistence service', () => {
      const initialTransactions = new Map<string, Transaction>();
      initialTransactions.set(sampleTx1.orderId, sampleTx1);
      mockPersistenceService.loadTransactions = jest.fn().mockReturnValue(initialTransactions);
      
      const newStore = new TransactionStore(mockPersistenceService);
      expect(newStore.getTransaction(sampleTx1.orderId)).toEqual(sampleTx1);
      expect(newStore.getTransactions().size).toBe(1);
    });
  });

  describe('addTransaction', () => {
    it('should add the transaction to the internal map', () => {
      store.addTransaction(sampleTx1);
      expect(store.getTransaction(sampleTx1.orderId)).toEqual(sampleTx1);
      expect(store.getTransactions().size).toBe(1);
    });

    it('should call saveTransactions on the persistence service', () => {
      store.addTransaction(sampleTx1);
      expect(mockPersistenceService.saveTransactions).toHaveBeenCalledTimes(1);
      expect(mockPersistenceService.saveTransactions).toHaveBeenCalledWith(store.getTransactions());
    });

    it('should throw an error if orderId is missing', () => {
      expect(() => store.addTransaction(sampleTx3WithoutOrderId)).toThrow('Transaction must have an orderId');
      expect(mockPersistenceService.saveTransactions).not.toHaveBeenCalled();
    });
  });

  describe('getTransaction', () => {
    it('should retrieve the correct transaction by orderId', () => {
      store.addTransaction(sampleTx1);
      store.addTransaction(sampleTx2);
      expect(store.getTransaction(sampleTx1.orderId)).toEqual(sampleTx1);
      expect(store.getTransaction(sampleTx2.orderId)).toEqual(sampleTx2);
    });

    it('should return undefined if the transaction does not exist', () => {
      expect(store.getTransaction('NON_EXISTENT_ORDER_ID')).toBeUndefined();
    });
  });

  describe('getTransactions', () => {
    it('should return the entire map of transactions', () => {
      store.addTransaction(sampleTx1);
      store.addTransaction(sampleTx2);
      const transactionsMap = store.getTransactions();
      expect(transactionsMap.size).toBe(2);
      expect(transactionsMap.get(sampleTx1.orderId)).toEqual(sampleTx1);
      expect(transactionsMap.get(sampleTx2.orderId)).toEqual(sampleTx2);
    });

    it('should return an empty map if no transactions have been added', () => {
      expect(store.getTransactions().size).toBe(0);
    });
  });

  describe('getLastTransaction', () => {
    it('should return undefined if there are no transactions', () => {
      expect(store.getLastTransaction()).toBeUndefined();
    });

    it('should return the only transaction if there is only one', () => {
      store.addTransaction(sampleTx1);
      expect(store.getLastTransaction()).toEqual(sampleTx1);
    });

    it('should return the transaction with the latest timestamp among multiple transactions', () => {
      const earlierTx: Transaction = { ...sampleTx1, timestamp: new Date('2023-01-01T09:00:00.000Z').toISOString() };
      const latestTx: Transaction = { ...sampleTx2, timestamp: new Date('2023-01-01T12:00:00.000Z').toISOString() };
      store.addTransaction(earlierTx);
      store.addTransaction(sampleTx1); // 10:00 AM
      store.addTransaction(latestTx);  // 12:00 PM
      expect(store.getLastTransaction()).toEqual(latestTx);
    });
  });

  describe('updateTransaction', () => {
    beforeEach(() => {
      store.addTransaction(sampleTx1); // Add initial transaction
    });

    it('should update an existing transaction with partial data', () => {
      const updates: Partial<Transaction> = {
        status: STATUS.APPROVED as TransactionStatus,
        resultCode: 0,
        resultMessage: 'Success!',
      };
      store.updateTransaction(sampleTx1.orderId, updates);
      
      const updatedTx = store.getTransaction(sampleTx1.orderId);
      expect(updatedTx).toBeDefined();
      expect(updatedTx?.status).toBe(STATUS.APPROVED);
      expect(updatedTx?.resultCode).toBe(0);
      expect(updatedTx?.resultMessage).toBe('Success!');
      expect(updatedTx?.amount).toBe(sampleTx1.amount); // Ensure other fields are unchanged
    });

    it('should call saveTransactions on the persistence service after updating', () => {
      const updates: Partial<Transaction> = { status: STATUS.DECLINED as TransactionStatus };
      store.updateTransaction(sampleTx1.orderId, updates);
      expect(mockPersistenceService.saveTransactions).toHaveBeenCalledTimes(2); // 1 for add, 1 for update
      expect(mockPersistenceService.saveTransactions).toHaveBeenCalledWith(store.getTransactions());
    });

    it('should not call saveTransactions if the transaction to update does not exist', () => {
      const updates: Partial<Transaction> = { status: STATUS.APPROVED as TransactionStatus };
      store.updateTransaction('NON_EXISTENT_ORDER_ID', updates);
      // saveTransactions was called once during the initial addTransaction in beforeEach
      expect(mockPersistenceService.saveTransactions).toHaveBeenCalledTimes(1); 
    });

    it('should not modify the map if the transaction to update does not exist', () => {
      const initialSize = store.getTransactions().size;
      store.updateTransaction('NON_EXISTENT_ORDER_ID', { status: STATUS.APPROVED as TransactionStatus });
      expect(store.getTransactions().size).toBe(initialSize);
      expect(store.getTransaction('NON_EXISTENT_ORDER_ID')).toBeUndefined();
    });
  });

  describe('isDeviceBusy', () => {
    it('should return false if there are no transactions', () => {
      expect(store.isDeviceBusy()).toBe(false);
    });

    it('should return false if there are transactions but none are pending', () => {
      store.addTransaction({ ...sampleTx1, status: STATUS.APPROVED as TransactionStatus });
      store.addTransaction({ ...sampleTx2, status: STATUS.DECLINED as TransactionStatus });
      expect(store.isDeviceBusy()).toBe(false);
    });

    it('should return true if there is at least one pending transaction', () => {
      store.addTransaction({ ...sampleTx1, status: STATUS.APPROVED as TransactionStatus });
      store.addTransaction(sampleTx2); // sampleTx2 is APPROVED by default in this test suite
      store.addTransaction({ ...sampleTx1, orderId: 'ORDER003', status: STATUS.PENDING as TransactionStatus }); // This one is pending
      expect(store.isDeviceBusy()).toBe(true);
    });

    it('should return true if all transactions are pending', () => {
      store.addTransaction({ ...sampleTx1, status: STATUS.PENDING as TransactionStatus });
      store.addTransaction({ ...sampleTx2, orderId: 'ORDER003', status: STATUS.PENDING as TransactionStatus });
      expect(store.isDeviceBusy()).toBe(true);
    });
  });
});
