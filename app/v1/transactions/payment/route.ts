import { NextResponse } from 'next/server';
import { RESPONSE_ERROR, STATUS, HEADER_X_SOURCE, SOURCE_COMERCIA, RESULT_CODES } from '../constants';
import { getTransactionStore } from '../store';
import type { PaymentRequest, Transaction, TransactionResponse } from '../types';
// import { generateId } from '../utils/idUtils'; // No longer directly used here
// import { getProcessingTime } from '../utils/processingUtils'; // No longer directly used here
import { createTransactionObject } from '../services/transactionService'; // Added import

function validatePaymentRequest(request: Request, body: PaymentRequest | null): NextResponse | null {
  if (request.headers.get(HEADER_X_SOURCE) !== SOURCE_COMERCIA) {
    return NextResponse.json({
      resultCode: RESULT_CODES.EMV_INITIALIZATION_ERROR,
      resultMessage: RESPONSE_ERROR[RESULT_CODES.EMV_INITIALIZATION_ERROR.toString()]
    });
  }

  // Basic body validation, ensuring it's not null and has essential fields
  if (!body || body.amount == null || !body.orderId) { // Check for null amount explicitly
    return NextResponse.json({
      resultCode: RESULT_CODES.MSG_FORMAT_ERROR,
      resultMessage: RESPONSE_ERROR[RESULT_CODES.MSG_FORMAT_ERROR.toString()]
    });
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as PaymentRequest;

    const validationError = validatePaymentRequest(request, body);
    if (validationError) {
      return validationError;
    }

    const store = getTransactionStore();
    // const deviceType = body.deviceType || 'WIFI'; // Moved to createTransactionObject
    // const processingTime = getProcessingTime(deviceType); // Moved to createTransactionObject

    // const tx: Transaction = { // Logic moved to createTransactionObject
    //   id: generateId(),
    //   amount: body.amount,
    //   currency: "EUR",
    //   status: STATUS.PENDING,
    //   orderId: body.orderId,
    //   resultCode: 1001,
    //   resultMessage: RESPONSE_ERROR['1001'],
    //   timestamp: new Date().toISOString(),
    //   tokenization: body.tokenization,
    //   deviceType: deviceType,
    //   processingTime: processingTime,
    //   processingEndTime: new Date(Date.now() + processingTime).toISOString()
    // };
    const tx = createTransactionObject(body); // Use the new service function

    store.addTransaction(tx);

    const response: TransactionResponse = {
      orderId: tx.orderId, // Changed from body.orderId to tx.orderId
      resultCode: tx.resultCode, // Use resultCode from tx object
      resultMessage: tx.resultMessage, // Use resultMessage from tx object
      deviceType: tx.deviceType
    };

    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json({
      resultCode: RESULT_CODES.MSG_FORMAT_ERROR,
      resultMessage: RESPONSE_ERROR[RESULT_CODES.MSG_FORMAT_ERROR.toString()]
    });
  }
} 