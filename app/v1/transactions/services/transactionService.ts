import type { PaymentRequest, Transaction } from '../types';
import { STATUS, RESPONSE_ERROR, DEVICE_TYPE_WIFI, CURRENCY_EUR, RESULT_CODES } from '../constants';
import { generateId } from '../utils/idUtils';
import { getProcessingTime } from '../utils/processingUtils';

export function createTransactionObject(body: PaymentRequest): Transaction {
  const deviceType = body.deviceType || DEVICE_TYPE_WIFI; // Default to WIFI
  const processingTime = getProcessingTime(deviceType);

  return {
    id: generateId(),
    amount: body.amount,
    currency: CURRENCY_EUR,
    status: STATUS.PENDING,
    orderId: body.orderId,
    resultCode: RESULT_CODES.SERVICE_BUSY, // Initial pending status code
    resultMessage: RESPONSE_ERROR[RESULT_CODES.SERVICE_BUSY.toString()], // Initial pending status message
    timestamp: new Date().toISOString(),
    tokenization: body.tokenization,
    deviceType: deviceType,
    processingTime: processingTime,
    processingEndTime: new Date(Date.now() + processingTime).toISOString()
  };
}
