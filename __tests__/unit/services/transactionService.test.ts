import { createTransactionObject, Clock } from '../../../app/v1/transactions/services/transactionService';
import { generateId } from '../../../app/v1/transactions/utils/idUtils';
import { getProcessingTime } from '../../../app/v1/transactions/utils/processingUtils';
import { PaymentRequest, Transaction } from '../../../app/v1/transactions/types'; // Adjust path
import { STATUS, RESPONSE_ERROR, DEVICE_TYPE_WIFI, CURRENCY_EUR, RESULT_CODES } from '../../../app/v1/transactions/constants'; // Adjust path

// Mock utility functions
jest.mock('../../../app/v1/transactions/utils/idUtils');
jest.mock('../../../app/v1/transactions/utils/processingUtils');

describe('transactionService', () => {
  describe('createTransactionObject', () => {
    const mockGeneratedId = 'TX123456';
    const mockProcessingTimeWifi = 3000; // Example time for WIFI
    const mockProcessingTimeCable = 1500; // Example time for CABLE
    let mockClock: Clock;

    beforeEach(() => {
      // Reset mocks for each test
      (generateId as jest.Mock).mockReturnValue(mockGeneratedId);
      (getProcessingTime as jest.Mock).mockImplementation((deviceType: string) => {
        return deviceType === DEVICE_TYPE_WIFI ? mockProcessingTimeWifi : mockProcessingTimeCable;
      });
      mockClock = { now: () => new Date('2023-01-01T12:00:00.000Z').getTime() };
    });

    afterEach(() => {
      jest.restoreAllMocks(); // Restore original implementations
    });

    const minimalBody: PaymentRequest = {
      amount: 100,
      orderId: 'ORDER001',
    };

    it('should create a transaction object with minimal valid input and default WIFI deviceType', () => {
      const transaction = createTransactionObject(minimalBody, mockClock);

      expect(generateId).toHaveBeenCalled();
      expect(getProcessingTime).toHaveBeenCalledWith(DEVICE_TYPE_WIFI); // Default deviceType

      expect(transaction).toEqual({
        id: mockGeneratedId,
        amount: minimalBody.amount,
        currency: CURRENCY_EUR,
        status: STATUS.PENDING,
        orderId: minimalBody.orderId,
        resultCode: RESULT_CODES.SERVICE_BUSY,
        resultMessage: RESPONSE_ERROR[RESULT_CODES.SERVICE_BUSY.toString()],
        timestamp: new Date('2023-01-01T12:00:00.000Z').toISOString(),
        tokenization: undefined, // No tokenization in minimal body
        deviceType: DEVICE_TYPE_WIFI,
        processingTime: mockProcessingTimeWifi,
        processingEndTime: new Date(new Date('2023-01-01T12:00:00.000Z').getTime() + mockProcessingTimeWifi).toISOString(),
      });
    });

    it('should create a transaction object with CABLE deviceType when specified', () => {
      const bodyWithCable: PaymentRequest = {
        ...minimalBody,
        deviceType: 'CABLE', // Explicitly CABLE
      };
      const transaction = createTransactionObject(bodyWithCable, mockClock);

      expect(getProcessingTime).toHaveBeenCalledWith('CABLE');
      expect(transaction.deviceType).toBe('CABLE');
      expect(transaction.processingTime).toBe(mockProcessingTimeCable);
      expect(transaction.processingEndTime).toBe(new Date(new Date('2023-01-01T12:00:00.000Z').getTime() + mockProcessingTimeCable).toISOString());
    });

    it('should include tokenization details when provided in the body', () => {
      const bodyWithTokenization: PaymentRequest = {
        ...minimalBody,
        tokenization: {
          createToken: true,
          codeOfUse: 'C',
          customerId: 'CUST123',
        },
      };
      const transaction = createTransactionObject(bodyWithTokenization, mockClock);

      expect(transaction.tokenization).toEqual(bodyWithTokenization.tokenization);
    });

    it('should correctly calculate processingEndTime', () => {
      // Relies on Date.now() mock and getProcessingTime mock
      const transaction = createTransactionObject(minimalBody, mockClock);
      const expectedEndTime = new Date(new Date('2023-01-01T12:00:00.000Z').getTime() + mockProcessingTimeWifi);
      expect(transaction.processingEndTime).toBe(expectedEndTime.toISOString());
    });

    it('should have all required fields in the returned transaction object', () => {
      const transaction = createTransactionObject(minimalBody, mockClock);
      expect(transaction.id).toBeDefined();
      expect(transaction.amount).toBeDefined();
      expect(transaction.currency).toBeDefined();
      expect(transaction.status).toBeDefined();
      expect(transaction.orderId).toBeDefined();
      expect(transaction.resultCode).toBeDefined();
      expect(transaction.resultMessage).toBeDefined();
      expect(transaction.timestamp).toBeDefined();
      expect(transaction.deviceType).toBeDefined();
      expect(transaction.processingTime).toBeDefined();
      expect(transaction.processingEndTime).toBeDefined();
    });
  });
});
