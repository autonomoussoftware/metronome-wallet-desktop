#!/bin/bash

echo "Building and signing application for macOS"
export CSC_LINK="file://met.p12"

echo "Insert the certificate password and press enter:"
read -s PASSWORD

export CSC_KEY_PASSWORD=$PASSWORD

npm run dist

