import { NextResponse } from 'next/server';
import { RESPONSE_ERROR, STATUS, CURRENCY_EUR, RESULT_CODES, DEVICE_TYPE_WIFI, HEADER_X_SOURCE, SOURCE_COMERCIA } from '../../constants';
import { getTransactionStore } from '../../store';
import type { PaymentRequest, Transaction } from '../../types';
import { generateId } from '../../utils/idUtils';
import { getProcessingTime } from '../../utils/processingUtils';

export async function POST(request: Request) {
    if (request.headers.get(HEADER_X_SOURCE) !== SOURCE_COMERCIA) {
        return NextResponse.json({
            resultCode: RESULT_CODES.EMV_INITIALIZATION_ERROR,
            resultMessage: RESPONSE_ERROR[RESULT_CODES.EMV_INITIALIZATION_ERROR.toString()]
        });
    }

    try {
        const body = await request.json() as PaymentRequest;
        const store = getTransactionStore();

        if (!body.amount || !body.orderId) {
            return NextResponse.json({
                resultCode: RESULT_CODES.MSG_FORMAT_ERROR,
                resultMessage: RESPONSE_ERROR[RESULT_CODES.MSG_FORMAT_ERROR.toString()]
            });
        }

        if (store.isDeviceBusy()) {
            return NextResponse.json({
                resultCode: RESULT_CODES.SERVICE_BUSY,
                resultMessage: RESPONSE_ERROR[RESULT_CODES.SERVICE_BUSY.toString()]
            });
        }

        const deviceType = body.deviceType || DEVICE_TYPE_WIFI;
        const processingTime = getProcessingTime(deviceType);

        const tx: Transaction = {
            id: generateId(),
            amount: body.amount,
            currency: CURRENCY_EUR,
            status: STATUS.PENDING,
            orderId: body.orderId,
            resultCode: RESULT_CODES.SERVICE_BUSY,
            resultMessage: RESPONSE_ERROR[RESULT_CODES.SERVICE_BUSY.toString()],
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
            resultCode: RESULT_CODES.SERVICE_BUSY,
            resultMessage: RESPONSE_ERROR[RESULT_CODES.SERVICE_BUSY.toString()],
            deviceType: tx.deviceType
        });

    } catch (error) {
        return NextResponse.json({
            resultCode: RESULT_CODES.MSG_FORMAT_ERROR,
            resultMessage: RESPONSE_ERROR[RESULT_CODES.MSG_FORMAT_ERROR.toString()]
        });
    }
} 