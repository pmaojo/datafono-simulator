import { NextResponse } from 'next/server';
import { RESPONSE_ERROR } from '../../transactions/constants';
import { getTransactionStore } from '../../transactions/store';

interface DetailsRequest {
    startDate?: string;
    endDate?: string;
    type?: string;
}

export async function POST(request: Request) {
    if (request.headers.get('X-SOURCE') !== 'COMERCIA') {
        return NextResponse.json({
            resultCode: 1010,
            resultMessage: RESPONSE_ERROR['1010']
        });
    }

    try {
        const body = await request.json() as DetailsRequest;
        const store = getTransactionStore();
        const transactions = Array.from(store.getTransactions().values());

        // Filtrar por fecha si se especifica
        let filtered = transactions;
        if (body.startDate) {
            const startDate = new Date(body.startDate);
            filtered = filtered.filter(tx => new Date(tx.timestamp) >= startDate);
        }
        if (body.endDate) {
            const endDate = new Date(body.endDate);
            filtered = filtered.filter(tx => new Date(tx.timestamp) <= endDate);
        }
        if (body.type) {
            filtered = filtered.filter(tx => tx.type === body.type);
        }

        // Ordenar por fecha descendente
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return NextResponse.json({
            resultCode: 0,
            resultMessage: "Success",
            transactions: filtered.map(tx => ({
                orderId: tx.orderId,
                resultCode: tx.resultCode,
                resultMessage: tx.resultMessage,
                deviceType: tx.deviceType,
                amount: tx.amount,
                currency: tx.currency,
                timestamp: tx.timestamp,
                type: tx.type,
                status: tx.status
            }))
        });

    } catch (error) {
        return NextResponse.json({
            resultCode: 2,
            resultMessage: RESPONSE_ERROR['2']
        });
    }
} 