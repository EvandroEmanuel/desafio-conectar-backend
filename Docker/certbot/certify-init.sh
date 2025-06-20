#!/bin/sh

# Waits for nginx to be available, then gets the first certificate.

set -e

until nc -z nginx 80; do
    echo "Waiting for nginx..."
    sleep 5s & wait ${!}
done

echo "nameserver 8.8.8.8" > /etc/resolv.conf
echo "nameserver 8.8.4.4" >> /etc/resolv.conf

echo "Getting certificate..."

certbot certonly \
    --webroot \
    --webroot-path "/vol/www/" \
    --domain "$DOMAIN" \
    --email "$EMAIL" \
    --rsa-key-size 4096 \
    --agree-tos \
    --noninteractive \
