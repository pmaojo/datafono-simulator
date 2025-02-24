#!/bin/bash

echo "Iniciando terminal..."
INIT_RESPONSE=$(curl -s -X POST \
  -H "X-SOURCE: COMERCIA" \
  -H "Content-Type: application/json" \
  http://localhost:3002/v1/transactions/init \
  -d '{"identificationData":{"user":null,"pass":null}}')

echo "Respuesta de inicialización: $INIT_RESPONSE"

echo "Esperando 1 segundo antes de iniciar el pago..."
sleep 1

echo "Iniciando pago..."
PAYMENT_RESPONSE=$(curl -s -X POST \
  -H "X-SOURCE: COMERCIA" \
  -H "Content-Type: application/json" \
  http://localhost:3002/v1/transactions/payment \
  -d '{
    "amount": 10.00,
    "orderId": "tx-00000001",
    "description": "Test Regular Saga"
  }')

echo "Respuesta inicial: $PAYMENT_RESPONSE"

echo "Esperando 2 segundos antes de consultar estado..."
sleep 2

# Polling usando el mecanismo del saga regular (2 segundos entre intentos)
attempt=1
elapsed=0
max_time=120 # 120 segundos = 2 minutos como en el saga

while [ $elapsed -lt $max_time ]; do
  echo "Intento $attempt de consulta de estado..."
  
  STATUS_RESPONSE=$(curl -s -X POST \
    -H "X-SOURCE: COMERCIA" \
    -H "Content-Type: application/json" \
    http://localhost:3002/v1/transactions/status \
    -d '{
      "orderId": "tx-00000001"
    }')
  
  echo "Estado actual: $STATUS_RESPONSE"
  
  if [[ $STATUS_RESPONSE == *"resultCode\":0"* ]]; then
    echo "Transacción completada exitosamente"
    break
  elif [[ $STATUS_RESPONSE == *"resultCode\":950"* ]]; then
    echo "Transacción rechazada"
    break
  fi
  
  echo "Esperando 2 segundos antes del siguiente intento..."
  sleep 2
  ((attempt++))
  ((elapsed+=2))
done

if [ $elapsed -ge $max_time ]; then
  echo "Timeout después de $max_time segundos"
fi 