import { NextResponse } from 'next/server';
import { RESPONSE_ERROR, STATUS } from '../../../constants';
import { getTransactionStore } from '../../../store';
import type { PaymentRequest, Transaction } from '../../../types';

function generateId() {
    return `TX${Math.floor(Math.random() * 1000000)}`;
}

function getProcessingTime(deviceType: string): number {
    return deviceType === 'WIFI' ?
        Math.random() * 4000 + 2000 : // WIFI: 2-6 segundos
        Math.random() * 2000 + 1000;  // CABLE: 1-3 segundos
}

export async function POST(request: Request) {
    if (request.headers.get('X-SOURCE') !== 'COMERCIA') {
        return NextResponse.json({
            resultCode: 1010,
            resultMessage: RESPONSE_ERROR['1010']
        });
    }

    try {
        const body = await request.json() as PaymentRequest;
        const store = getTransactionStore();

        if (!body.amount || !body.orderId) {
            return NextResponse.json({
                resultCode: 2,
                resultMessage: RESPONSE_ERROR['2']
            });
        }

        if (store.isDeviceBusy()) {
            return NextResponse.json({
                resultCode: 1001,
                resultMessage: RESPONSE_ERROR['1001']
            });
        }

        const deviceType = body.deviceType || 'WIFI';
        const processingTime = getProcessingTime(deviceType);

        const tx: Transaction = {
            id: generateId(),
            amount: body.amount,
            currency: "EUR",
            status: STATUS.PENDING,
            orderId: body.orderId,
            resultCode: 1001,
            resultMessage: RESPONSE_ERROR['1001'],
            timestamp: new Date().toISOString(),
            tokenization: body.tokenization,
            deviceType: deviceType,
            processingTime: processingTime,
            processingEndTime: new Date(Date.now() + processingTime).toISOString(),
            type: 'preauth'
        };

        store.addTransaction(tx);

        return NextResponse.json({
            orderId: body.orderId,
            resultCode: 1001,
            resultMessage: RESPONSE_ERROR['1001'],
            deviceType: tx.deviceType
        });

    } catch (error) {
        return NextResponse.json({
            resultCode: 2,
            resultMessage: RESPONSE_ERROR['2']
        });
    }
} 