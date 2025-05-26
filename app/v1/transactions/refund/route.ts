import { NextResponse } from 'next/server';
import { getTransactionStore } from '../store';
import { RESPONSE_ERROR, STATUS, DEVICE_TYPE_WIFI, RESULT_CODES, CURRENCY_EUR, HEADER_X_SOURCE, SOURCE_COMERCIA } from '../constants';
import { Transaction } from '../types';
import { generateId } from '../utils/idUtils';

export async function POST(request: Request) {
  if (request.headers.get(HEADER_X_SOURCE) !== SOURCE_COMERCIA) {
    return NextResponse.json({
      resultCode: RESULT_CODES.EMV_INITIALIZATION_ERROR,
      resultMessage: RESPONSE_ERROR[RESULT_CODES.EMV_INITIALIZATION_ERROR.toString()]
    });
  }

  try {
    const body = await request.json();
    
    if (!body.transactionId || !body.amount || !body.orderId) {
      return NextResponse.json({
        resultCode: RESULT_CODES.MSG_FORMAT_ERROR,
        resultMessage: RESPONSE_ERROR[RESULT_CODES.MSG_FORMAT_ERROR.toString()]
      });
    }

    const store = getTransactionStore();
    
    // Crear transacción de reembolso
    const tx: Transaction = {
      id: generateId(),
      amount: body.amount,
      currency: CURRENCY_EUR,
      status: STATUS.PENDING,
      orderId: body.orderId,
      transactionId: body.transactionId,
      resultCode: RESULT_CODES.SERVICE_BUSY,
      resultMessage: RESPONSE_ERROR[RESULT_CODES.SERVICE_BUSY.toString()],
      timestamp: new Date().toISOString(),
      deviceType: DEVICE_TYPE_WIFI, // Added
    };

    store.addTransaction(tx);

    // Procesar en background
    setTimeout(() => {
      if (Math.random() < 0.9) {
        store.updateTransaction(tx.id!, { // Assuming tx.id will be defined
          status: STATUS.APPROVED,
          resultCode: RESULT_CODES.SUCCESS,
          resultMessage: RESPONSE_ERROR[RESULT_CODES.SUCCESS.toString()], // "Reembolso aprobado" could be a specific message
          authCode: Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
        });
      } else {
        store.updateTransaction(tx.id!, { // Assuming tx.id will be defined
          status: STATUS.DECLINED,
          resultCode: RESULT_CODES.REFUND_OPERATION_NOT_ALLOWED,
          resultMessage: RESPONSE_ERROR[RESULT_CODES.REFUND_OPERATION_NOT_ALLOWED.toString()],
          errorCode: RESULT_CODES.REFUND_OPERATION_NOT_ALLOWED.toString(),
          errorMessage: RESPONSE_ERROR[RESULT_CODES.REFUND_OPERATION_NOT_ALLOWED.toString()]
        });
      }
    }, Math.random() * 2000);

    return NextResponse.json(tx);

  } catch (error) {
    return NextResponse.json({
      resultCode: RESULT_CODES.MSG_FORMAT_ERROR,
      resultMessage: RESPONSE_ERROR[RESULT_CODES.MSG_FORMAT_ERROR.toString()]
    });
  }
} 