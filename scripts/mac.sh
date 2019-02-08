#!/bin/bash

echo "Building and signing application for macOS"

cat > .env << EOF
DEBUG=$DEBUG
ENABLED_CHAINS=$ENABLED_CHAINS
SENTRY_DSN=$SENTRY_DSN
TRACKING_ID=$TRACKING_ID
EOF

echo "Insert the certificate password and press Enter:"
read -rs PASSWORD

CSC_LINK="file://as-mac.p12" CSC_KEY_PASSWORD=$PASSWORD npm run release
