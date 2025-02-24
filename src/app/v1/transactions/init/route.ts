import { NextRequest } from 'next/server'
import { ENVIRONMENTS } from '@/__tests__/mocks/datafono/config'

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  console.log('URL:', url.toString())
  console.log('Protocol:', url.protocol)
  console.log('Headers:', Object.fromEntries(request.headers))
  
  const body = await request.json()
  console.log('Body:', body)
  
  return Response.json({
    resultCode: 1000,
    resultMessage: 'Init successful',
    ...body
  }, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    }
  })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    }
  })
} 