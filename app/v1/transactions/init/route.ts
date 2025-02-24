import { NextResponse } from 'next/server';
import { RESPONSE_ERROR } from '../constants';
import type { InitRequest } from '../types';

export async function POST(request: Request) {
  if (request.headers.get('X-SOURCE') !== 'COMERCIA') {
    return NextResponse.json({
      resultCode: 1010,
      resultMessage: RESPONSE_ERROR['1010']
    });
  }

  try {
    const body = await request.json() as InitRequest;

    if (!body.user) {
      return NextResponse.json({
        resultCode: 2,
        resultMessage: RESPONSE_ERROR['2']
      });
    }

    // Simulamos una inicialización exitosa
    return NextResponse.json({
      resultCode: 1000,
      resultMessage: "initialization succesfull"
    });

  } catch (error) {
    return NextResponse.json({
      resultCode: 2,
      resultMessage: RESPONSE_ERROR['2']
    });
  }
} 