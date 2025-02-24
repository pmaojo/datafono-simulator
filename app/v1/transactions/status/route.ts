import { NextResponse } from 'next/server';
import { RESPONSE_ERROR, STATUS } from '../constants';
import { getTransactionStore } from '../store';

interface StatusRequest {
    orderId: string;
}

export async function POST(request: Request) {
    if (request.headers.get('X-SOURCE') !== 'COMERCIA') {
        return NextResponse.json({
            resultCode: 1010,
            resultMessage: RESPONSE_ERROR['1010']
        });
    }

    try {
        const body = await request.json() as StatusRequest;
        const store = getTransactionStore();

        if (!body.orderId) {
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
                    resultCode: 0,
                    resultMessage: "Success",
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
                    resultCode: 950,
                    resultMessage: RESPONSE_ERROR['950']
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
            resultCode: 1001,
            resultMessage: RESPONSE_ERROR['1001'],
            deviceType: tx.deviceType
        });

    } catch (error) {
        console.error('Error processing status request:', error);
        return NextResponse.json({
            resultCode: 2,
            resultMessage: RESPONSE_ERROR['2']
        });
    }
} 