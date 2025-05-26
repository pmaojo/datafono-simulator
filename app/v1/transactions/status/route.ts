import { NextResponse } from 'next/server';
import { RESPONSE_ERROR, STATUS, RESULT_CODES, HEADER_X_SOURCE, SOURCE_COMERCIA } from '../constants';
import { getTransactionStore } from '../store';

interface StatusRequest {
    orderId: string;
}

export async function POST(request: Request) {
    if (request.headers.get(HEADER_X_SOURCE) !== SOURCE_COMERCIA) {
        return NextResponse.json({
            resultCode: RESULT_CODES.EMV_INITIALIZATION_ERROR,
            resultMessage: RESPONSE_ERROR[RESULT_CODES.EMV_INITIALIZATION_ERROR.toString()]
        });
    }

    try {
        const body = await request.json() as StatusRequest;
        const store = getTransactionStore();

        if (!body.orderId) {
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

        // Si la transacción ya está completada, devolvemos su estado
        if (tx.status === STATUS.APPROVED || tx.status === STATUS.DECLINED) {
            return NextResponse.json({
                orderId: tx.orderId || '',
                resultCode: tx.resultCode,
                resultMessage: tx.resultMessage || '',
                deviceType: tx.deviceType,
                ticket: tx.ticket,
                tokenization: tx.tokenization
            });
        }

        // Si la transacción está pendiente, verificamos si ya pasó el tiempo de procesamiento
        const now = new Date();
        const processingEndTime = new Date(tx.processingEndTime!);

        if (now >= processingEndTime) {
            // 90% de probabilidad de éxito
            if (Math.random() < 0.9) {
                const updatedTx = {
                    ...tx,
                    status: STATUS.APPROVED,
                    resultCode: RESULT_CODES.SUCCESS,
                    resultMessage: RESPONSE_ERROR[RESULT_CODES.SUCCESS.toString()],
                    authCode: Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
                };
                store.updateTransaction(tx.orderId!, updatedTx);
                return NextResponse.json({
                    orderId: updatedTx.orderId,
                    resultCode: updatedTx.resultCode,
                    resultMessage: updatedTx.resultMessage,
                    deviceType: updatedTx.deviceType
                });
            } else {
                const updatedTx = {
                    ...tx,
                    status: STATUS.DECLINED,
                    resultCode: RESULT_CODES.REFUND_OPERATION_NOT_ALLOWED, // Assuming 950 is for refund declined, or a general decline
                    resultMessage: RESPONSE_ERROR[RESULT_CODES.REFUND_OPERATION_NOT_ALLOWED.toString()]
                };
                store.updateTransaction(tx.orderId!, updatedTx);
                return NextResponse.json({
                    orderId: updatedTx.orderId,
                    resultCode: updatedTx.resultCode,
                    resultMessage: updatedTx.resultMessage,
                    deviceType: updatedTx.deviceType
                });
            }
        }

        // Si aún no ha pasado el tiempo de procesamiento, devolvemos estado ocupado
        return NextResponse.json({
            orderId: tx.orderId,
            resultCode: RESULT_CODES.SERVICE_BUSY,
            resultMessage: RESPONSE_ERROR[RESULT_CODES.SERVICE_BUSY.toString()],
            deviceType: tx.deviceType
        });

    } catch (error) {
        console.error('Error processing status request:', error);
        return NextResponse.json({
            resultCode: RESULT_CODES.MSG_FORMAT_ERROR,
            resultMessage: RESPONSE_ERROR[RESULT_CODES.MSG_FORMAT_ERROR.toString()]
        });
    }
} 