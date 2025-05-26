import { NextResponse } from 'next/server';
import { RESPONSE_ERROR, STATUS, RESULT_CODES, HEADER_X_SOURCE, SOURCE_COMERCIA } from '../../constants';
import { getTransactionStore } from '../../store';
import type { Transaction } from '../../types';

interface CompleteRequest {
    orderId: string;
    amount: number;
}

export async function POST(request: Request) {
    if (request.headers.get(HEADER_X_SOURCE) !== SOURCE_COMERCIA) {
        return NextResponse.json({
            resultCode: RESULT_CODES.EMV_INITIALIZATION_ERROR,
            resultMessage: RESPONSE_ERROR[RESULT_CODES.EMV_INITIALIZATION_ERROR.toString()]
        });
    }

    try {
        const body = await request.json() as CompleteRequest;
        const store = getTransactionStore();

        if (!body.orderId || !body.amount) {
            return NextResponse.json({
                resultCode: RESULT_CODES.MSG_FORMAT_ERROR,
                resultMessage: RESPONSE_ERROR[RESULT_CODES.MSG_FORMAT_ERROR.toString()]
            });
        }

        const tx = store.getTransaction(body.orderId);
        if (!tx) {
            return NextResponse.json({
                resultCode: RESULT_CODES.TRANSACTION_NOT_FOUND,
                resultMessage: RESPONSE_ERROR[RESULT_CODES.TRANSACTION_NOT_FOUND.toString()]
            });
        }

        if (tx.type !== 'preauth') {
            return NextResponse.json({
                resultCode: RESULT_CODES.INVALID_PARAMS_ERROR, // Assuming this is the correct code for invalid operation type
                resultMessage: RESPONSE_ERROR[RESULT_CODES.INVALID_PARAMS_ERROR.toString()]
            });
        }

        if (tx.status !== STATUS.APPROVED) {
            return NextResponse.json({
                resultCode: RESULT_CODES.REFUND_OPERATION_NOT_ALLOWED, // Or a more general "OPERATION_NOT_ALLOWED" or specific "PREAUTH_NOT_APPROVED"
                resultMessage: RESPONSE_ERROR[RESULT_CODES.REFUND_OPERATION_NOT_ALLOWED.toString()]
            });
        }

        const updatedTx: Transaction = {
            ...tx,
            amount: body.amount,
            status: STATUS.APPROVED,
            resultCode: RESULT_CODES.SUCCESS,
            resultMessage: RESPONSE_ERROR[RESULT_CODES.SUCCESS.toString()],
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
            resultCode: RESULT_CODES.MSG_FORMAT_ERROR,
            resultMessage: RESPONSE_ERROR[RESULT_CODES.MSG_FORMAT_ERROR.toString()]
        });
    }
} 