import { NextResponse } from 'next/server';
import { getTransactionStore } from '../store';
import { RESPONSE_ERROR, STATUS } from '../constants';
import { Transaction } from '../types';
import { generateId } from '../utils/idUtils';

export async function POST(request: Request) {
  if (request.headers.get('X-SOURCE') !== 'COMERCIA') {
    return NextResponse.json({
      resultCode: 1010,
      resultMessage: RESPONSE_ERROR['1010']
    });
  }

  try {
    const body = await request.json();
    
    if (!body.transactionId || !body.amount || !body.orderId) {
      return NextResponse.json({
        resultCode: 2,
        resultMessage: RESPONSE_ERROR['2']
      });
    }

    const store = getTransactionStore();
    
    // Crear transacción de reembolso
    const tx: Transaction = {
      id: generateId(),
      amount: body.amount,
      currency: "EUR",
      status: STATUS.PENDING,
      orderId: body.orderId,
      transactionId: body.transactionId,
      resultCode: 1001,
      resultMessage: RESPONSE_ERROR['1001'],
      timestamp: new Date().toISOString()
    };

    store.addTransaction(tx);

    // Procesar en background
    setTimeout(() => {
      if (Math.random() < 0.9) {
        store.updateTransaction(tx.id, {
          status: STATUS.APPROVED,
          resultCode: 0,
          resultMessage: "Reembolso aprobado",
          authCode: Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
        });
      } else {
        store.updateTransaction(tx.id, {
          status: STATUS.DECLINED,
          resultCode: 950,
          resultMessage: RESPONSE_ERROR['950'],
          errorCode: '950',
          errorMessage: RESPONSE_ERROR['950']
        });
      }
    }, Math.random() * 2000);

    return NextResponse.json(tx);

  } catch (error) {
    return NextResponse.json({
      resultCode: 2,
      resultMessage: RESPONSE_ERROR['2']
    });
  }
} 