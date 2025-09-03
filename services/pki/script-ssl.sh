#!/bin/bash

if [ ! -f rootCA.key ] || [ ! -f rootCA.pem ]; then
  echo "Root CA not found — creating a new one..."
  openssl genrsa -out rootCA.key 2048
  openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem \
    -subj "/C=CA/ST=None/L=NB/O=None/CN=MyRootCA"
  echo "rootCA.key and rootCA.pem have been generated."
else
  echo "rootCA.key and rootCA.pem already exist, skipping generation."
fi

read -p "Enter the domain (e.g. grafana.home.lan): " DOMAIN

KEY_FILE="$DOMAIN.key"
CSR_FILE="$DOMAIN.csr"
CRT_FILE="$DOMAIN.crt"
EXT_FILE="v3-$DOMAIN.ext"

echo "Generating key and CSR for $DOMAIN ..."
openssl req -new -newkey rsa:2048 -sha256 -nodes \
  -keyout "$KEY_FILE" \
  -subj "/C=CA/ST=None/L=NB/O=None/CN=$DOMAIN" \
  -out "$CSR_FILE"

echo "Creating extension file $EXT_FILE ..."
cat > "$EXT_FILE" <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
DNS.2 = *.$DOMAIN
EOF

echo "Signing the certificate ..."
openssl x509 -req -in "$CSR_FILE" -CA rootCA.pem -CAkey rootCA.key \
  -CAcreateserial -out "$CRT_FILE" -days 825 -sha256 -extfile "$EXT_FILE"

echo "Verifying the certificate ..."
openssl verify -CAfile rootCA.pem "$CRT_FILE"

echo "Certificate files for $DOMAIN have been created:"
ls -1 "$KEY_FILE" "$CSR_FILE" "$CRT_FILE" "$EXT_FILE"
