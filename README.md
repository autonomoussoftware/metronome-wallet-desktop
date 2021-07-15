<h1 align="center">
  <img src="./public/images/banner.png" alt="Metronome Wallet Desktop" width="50%">
</h1>

💻💰 Metronome Wallet for desktop computers

[![Build Status](https://travis-ci.com/autonomoussoftware/metronome-wallet-desktop.svg?branch=master)](https://travis-ci.com/autonomoussoftware/metronome-wallet-desktop)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![Metronome Desktop Wallet](https://metronome.io/images/metronome-apps-demo@2x.png)

## Development

Create a local `.env` file with the following content

```shell
ENABLED_CHAINS=
ROPSTEN_NODE_URL=

```

### Requirements

* [Node.js](https://nodejs.org) LTS (v12 minimum, v14 recommended)

### Launch

```bash
# Install dependencies
npm i

# Run dev mode
npm run dev
```

#### Troubleshooting

- If you get an error when installing the dependencies related to `node-gyp`, try using `sudo` to postinstall the deps
- For  windows, you might need to install the windows-build-tools. To do so, run 

```bash
npm i --global --production windows-build-tools
```

### Logs

The log output is in the next directories:

* **Linux:** `~/.config/<app name>/logs/{process-type}.log`
* **macOS:** `~/Library/Logs/<app name>/logs/{process-type}.log`
* **Windows:** `%USERPROFILE%\AppData\Roaming\<app name>\logs\{process-type}.log`

`process-type` being equal to `main`, `renderer` or `worker`

More info [github.com/megahertz/electron-log](https://github.com/megahertz/electron-log)

### Settings

* **Linux**: `~/.config/metronome-desktop-wallet/Settings`
* **macOS**: `~/Library/Application Support/metronome-desktop-wallet/Settings`
* **Windows**: `%APPDATA%\\metronome-desktop-wallet\\Settings`

To completely remove the application and start over, remove the settings file too.

### Production Build

```bash
# Run build process
npm run dist

# Run build process and publish to GitHub releases
npm run release
```

#### MacOs

You'll need to sign and notarize the app. To do, install the `met.p12` file in your local keychain.  
In addition to that, you'll have to set the following env variables in order to publish

```shell
# See below to complete these two fields
APPLE_ID=
APPLE_ID_PASSWORD=
# See electron-build docs on how to complete these two
CSC_LINK=
CSC_KEY_PASSWORD=
# Github token from your developer settings
GH_TOKEN=
```

You'll need to follow [these steps to create an app specific password](https://support.apple.com/en-us/HT204397) and you'll set the generated value in `APPLE_ID_PASSWORD` together with your apple id in `APPLE_ID`.
For the github token, create an access token with the `repo` permission. [Steps to create an access token here](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token)

The signing certificate shall be in the root folder and be named `met.p12`. They will also have to be in your keychain
The certificate password will be required before signing.  
Keep in mind that the process might take ~10 minutes because notarizing takes time.  
You might be prompted your keychain password during the process in order to access the installed certificate.  

To publish the application, run

```shell
npm run release
```
In order to verify that the application has been successfully sign and notarized, run

```shell
# Verifies the app has been signed
codesign --verify --verbose ./dist/mac/Metronome\ Wallet.app

# Verifies the app has been notarized
spctl -a -t exec -vvv ./dist/mac/Metronome\ Wallet.app
```

## License

MIT
