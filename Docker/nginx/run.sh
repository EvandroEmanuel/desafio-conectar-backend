#!/bin/bash

# Habilita modo "exit-on-error"
set -e

# Verifica se o DOMAIN está definido
if [ -z "${DOMAIN}" ]; then
  echo "ERROR: A variável DOMAIN não está definida. Certifique-se de configurá-la no ambiente."
  exit 1
fi

echo "Iniciando script run.sh..."

# Cria dhparams.pem se não existir
echo "Verificando a existência de dhparams.pem..."
if [ ! -f "/vol/proxy/ssl-dhparams.pem" ]; then
  echo "dhparams.pem não encontrado - criando um novo..."
  if ! command -v openssl &> /dev/null; then
    echo "ERROR: OpenSSL não está instalado. Certifique-se de que está disponível no contêiner."
    exit 1
  fi
  openssl dhparam -out /vol/proxy/ssl-dhparams.pem 2048
fi

# Exporta variáveis necessárias para envsubst
export host='$host'
export request_uri='$request_uri'

# Verifica a existência do certificado SSL
echo "Verificando a existência do certificado SSL..."
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  echo "Certificado SSL não encontrado - habilitando apenas HTTP..."
  envsubst < /nginx.conf > /etc/nginx/conf.d/default.conf
else
  echo "Certificado SSL encontrado - habilitando HTTPS..."
  envsubst < /nginx-ssl.conf > /etc/nginx/conf.d/default.conf
fi

# Inicia o Nginx em modo debug
echo "Iniciando Nginx..."
nginx-debug -g 'daemon off;'
