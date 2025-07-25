import type { PaymentRequest, Transaction } from '../types';
import { STATUS, RESPONSE_ERROR, DEVICE_TYPE_WIFI, CURRENCY_EUR, RESULT_CODES } from '../constants';
import { generateId } from '../utils/idUtils';
import { getProcessingTime } from '../utils/processingUtils';

export interface Clock {
  now(): number;
}

export const systemClock: Clock = { now: () => Date.now() };

export function createTransactionObject(
  body: PaymentRequest,
  clock: Clock = systemClock
): Transaction {
  const deviceType = body.deviceType || DEVICE_TYPE_WIFI; // Default to WIFI
  const processingTime = getProcessingTime(deviceType);

  const timestamp = new Date(clock.now()).toISOString();
  const processingEndTime = new Date(clock.now() + processingTime).toISOString();

  return {
    id: generateId(),
    amount: body.amount,
    currency: CURRENCY_EUR,
    status: STATUS.PENDING,
    orderId: body.orderId,
    resultCode: RESULT_CODES.SERVICE_BUSY,
    resultMessage: RESPONSE_ERROR[RESULT_CODES.SERVICE_BUSY.toString()],
    timestamp,
    tokenization: body.tokenization,
    deviceType,
    processingTime,
    processingEndTime
  };
}
