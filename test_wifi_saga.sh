#!/bin/bash

echo "Iniciando terminal..."
INIT_RESPONSE=$(curl -s -X POST \
  -H "X-SOURCE: COMERCIA" \
  -H "Content-Type: application/json" \
  http://localhost:3002/api/v1/init \
  -d '{
    "user": "test",
    "pass": "test",
    "merchantId": "329811087",
    "terminalId": "00000021"
  }')

echo "Respuesta de inicialización: $INIT_RESPONSE"

echo "Esperando 1 segundo antes de iniciar el pago..."
sleep 1

echo "Iniciando pago..."
PAYMENT_RESPONSE=$(curl -s -X POST \
  -H "X-SOURCE: COMERCIA" \
  -H "Content-Type: application/json" \
  http://localhost:3002/api/v1/payment \
  -d '{
    "amount": 10.00,
    "orderId": "tx-00000001",
    "description": "Test WiFi Saga",
    "tokenization": {
      "createToken": true,
      "codeOfUse": "C",
      "customerId": "123456789"
    }
  }')

echo "Respuesta inicial: $PAYMENT_RESPONSE"

echo "Esperando 3 segundos antes de consultar estado..."
sleep 3

# Polling usando /status
attempt=1
while true; do
  echo "Intento $attempt de consulta de estado..."
  
  STATUS_RESPONSE=$(curl -s -X POST \
    -H "X-SOURCE: COMERCIA" \
    -H "Content-Type: application/json" \
    http://localhost:3002/api/v1/status \
    -d '{
      "transactionId": "tx-00000001",
      "merchantId": "329811087",
      "terminalId": "00000021"
    }')
  
  echo "Estado actual: $STATUS_RESPONSE"
  
  if [[ $STATUS_RESPONSE == *"resultCode\":0"* ]]; then
    echo "Transacción completada exitosamente"
    break
  elif [[ $STATUS_RESPONSE == *"resultCode\":950"* ]]; then
    echo "Transacción rechazada"
    break
  elif [ $attempt -gt 10 ]; then
    echo "Timeout después de 10 intentos"
    break
  fi
  
  echo "Esperando 1 segundo antes del siguiente intento..."
  sleep 1
  ((attempt++))
done 