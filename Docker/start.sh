#!/bin/bash

set -e

wait_for_database() {
  echo "🟡 Aguardando inicialização do banco de dados Postgres (${DB_HOST}:${DB_PORT})..."
  while ! nc -z "${DB_HOST}" "${DB_PORT}"; do
    sleep 2
  done
  echo "✅ Banco de dados Postgres inicializado (${DB_HOST}:${DB_PORT})!"
}

wait_for_database

echo "🚀 Iniciando aplicação NestJS..."
npm run start:prod
