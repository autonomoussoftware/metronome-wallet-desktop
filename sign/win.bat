@echo off
echo Building and signing application for Windows

SET CSC_LINK=as.p12

set /p PASSWORD="Insert the certificate password and press enter: "

SET CSC_KEY_PASSWORD=%PASSWORD%

npm run dist
