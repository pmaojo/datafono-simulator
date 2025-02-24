#!/bin/bash

# Matar procesos existentes en los puertos
lsof -ti:2002 | xargs kill -9 2>/dev/null
lsof -ti:2011 | xargs kill -9 2>/dev/null

# Forzar HTTP
export NEXT_PUBLIC_PROTOCOL=http
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Iniciar servidor Next.js en modo staging
echo "Iniciando servidor de staging en puerto 2002..."
NODE_ENV=development npm run dev:staging &
STAGING_PID=$!
echo $STAGING_PID > .datafono-staging.pid

# Iniciar servidor Next.js en modo producción
echo "Iniciando servidor de producción en puerto 2011..."
NODE_ENV=development npm run dev:prod &
PROD_PID=$!
echo $PROD_PID > .datafono-prod.pid

echo "Servidores iniciados:"
echo "Staging: http://datafono.staging.tpv-comercia.es:2002"
echo "Production: http://datafono.tpv-comercia.es:2011"

# Esperar a que los servidores estén listos
sleep 3

# Verificar que los puertos están escuchando
if ! lsof -i:2002 >/dev/null; then
    echo "Error: El puerto 2002 no está escuchando"
    exit 1
fi

if ! lsof -i:2011 >/dev/null; then
    echo "Error: El puerto 2011 no está escuchando"
    exit 1
fi

echo "Servidores listos y escuchando" 