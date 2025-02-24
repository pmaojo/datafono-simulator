import { NextResponse } from 'next/server';
import { RESPONSE_ERROR, STATUS } from '../../../constants';
import { getTransactionStore } from '../../../store';
import type { Transaction } from '../../../types';

interface CompleteRequest {
    orderId: string;
    amount: number;
}

export async function POST(request: Request) {
    if (request.headers.get('X-SOURCE') !== 'COMERCIA') {
        return NextResponse.json({
            resultCode: 1010,
            resultMessage: RESPONSE_ERROR['1010']
        });
    }

    try {
        const body = await request.json() as CompleteRequest;
        const store = getTransactionStore();

        if (!body.orderId || !body.amount) {
            return NextResponse.json({
                resultCode: 2,
                resultMessage: RESPONSE_ERROR['2']
            });
        }

        const tx = store.getTransaction(body.orderId);
        if (!tx) {
            return NextResponse.json({
                resultCode: 602,
                resultMessage: RESPONSE_ERROR['602']
            });
        }

        if (tx.type !== 'preauth') {
            return NextResponse.json({
                resultCode: 4,
                resultMessage: RESPONSE_ERROR['4']
            });
        }

        if (tx.status !== STATUS.APPROVED) {
            return NextResponse.json({
                resultCode: 950,
                resultMessage: RESPONSE_ERROR['950']
            });
        }

        const updatedTx: Transaction = {
            ...tx,
            amount: body.amount,
            status: STATUS.APPROVED,
            resultCode: 0,
            resultMessage: "Success",
            type: 'preauth_complete'
        };

        store.updateTransaction(body.orderId, updatedTx);

        return NextResponse.json({
            orderId: updatedTx.orderId,
            resultCode: updatedTx.resultCode,
            resultMessage: updatedTx.resultMessage,
            deviceType: updatedTx.deviceType
        });

    } catch (error) {
        return NextResponse.json({
            resultCode: 2,
            resultMessage: RESPONSE_ERROR['2']
        });
    }
} 