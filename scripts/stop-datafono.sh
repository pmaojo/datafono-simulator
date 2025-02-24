#!/bin/bash

# Detener servidor de staging
if [ -f .datafono-staging.pid ]; then
    kill $(cat .datafono-staging.pid)
    rm .datafono-staging.pid
    echo "Servidor de staging detenido"
fi

# Detener servidor de producción
if [ -f .datafono-prod.pid ]; then
    kill $(cat .datafono-prod.pid)
    rm .datafono-prod.pid
    echo "Servidor de producción detenido"
fi 