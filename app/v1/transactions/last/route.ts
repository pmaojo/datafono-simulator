import { NextResponse } from 'next/server';
import { RESPONSE_ERROR } from '../constants';
import { getTransactionStore } from '../store';

export async function GET(request: Request) {
    if (request.headers.get('X-SOURCE') !== 'COMERCIA') {
        return NextResponse.json({
            resultCode: 1010,
            resultMessage: RESPONSE_ERROR['1010']
        });
    }

    try {
        const store = getTransactionStore();
        const lastTx = store.getLastTransaction();

        if (!lastTx) {
            return NextResponse.json({
                resultCode: 602,
                resultMessage: RESPONSE_ERROR['602']
            });
        }

        return NextResponse.json({
            orderId: lastTx.orderId,
            resultCode: lastTx.resultCode,
            resultMessage: lastTx.resultMessage,
            deviceType: lastTx.deviceType,
            ticket: lastTx.ticket,
            tokenization: lastTx.tokenization,
            amount: lastTx.amount,
            currency: lastTx.currency,
            timestamp: lastTx.timestamp,
            type: lastTx.type
        });

    } catch (error) {
        return NextResponse.json({
            resultCode: 2,
            resultMessage: RESPONSE_ERROR['2']
        });
    }
} 