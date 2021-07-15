<h1 align="center">
  <img src="./public/images/banner.png" alt="Metronome Wallet Desktop" width="50%">
</h1>

💻💰 Metronome Wallet for desktop computers

[![Build Status](https://travis-ci.com/autonomoussoftware/metronome-wallet-desktop.svg?branch=master)](https://travis-ci.com/autonomoussoftware/metronome-wallet-desktop)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![Metronome Desktop Wallet](https://metronome.io/images/metronome-apps-demo@2x.png)

## Development

Create a local `.env` file with the following content:

```shell
ENABLED_CHAINS=
ROPSTEN_NODE_URL=
```

### Requirements

* [Node.js](https://nodejs.org) LTS (v12 minimum, v14 recommended)

### Launch

```sh
# Install dependencies
npm i

# Run dev mode
npm run dev
```

#### Troubleshooting

- For errors related to `node-gyp` when installing the dependencies, try using `sudo` to postinstall the dependencies.
- For Windows, installing `windows-build-tools` may be required. To do so, run:

```sh
npm i --global --production windows-build-tools
```

### Logs

The log output is in the next directories:

* **Linux:** `~/.config/<app name>/logs/{process-type}.log`
* **macOS:** `~/Library/Logs/<app name>/logs/{process-type}.log`
* **Windows:** `%USERPROFILE%\AppData\Roaming\<app name>\logs\{process-type}.log`

`process-type` being equal to `main`, `renderer` or `worker`

More info [github.com/megahertz/electron-log](https://github.com/megahertz/electron-log).

### Settings

* **Linux**: `~/.config/metronome-desktop-wallet/Settings`
* **macOS**: `~/Library/Application Support/metronome-desktop-wallet/Settings`
* **Windows**: `%APPDATA%\\metronome-desktop-wallet\\Settings`

To completely remove the application and start over, remove the settings file too.

### Production Build

```sh
# Run build process
npm run dist

# or

# Run build process and publish to GitHub releases
npm run release
```

#### macOs

The app needs to be signed and notarized.
To do so, install the `.p12` file in the local keychain (double click on it).

The certificate is obtained from the Apple Developer website.
The Developer ID Application is required.
The Developer ID Installer may be required too.
Once obtained, the `.cer` files have to be converted to `.p12` by providing the certificate passwords/private keys.

In addition to that, the following environment variables have to be set to publish:

```sh
# See below to complete these two:
APPLE_ID=
APPLE_ID_PASSWORD=
# See `electron-build` docs on how to complete these two:
CSC_LINK=
CSC_KEY_PASSWORD=
# Github personal access token to upload the files to repo releases.
GH_TOKEN=
```

Follow [these steps to create an app specific password](https://support.apple.com/en-us/HT204397).
The `APPLE_ID` variable is the Apple ID used to create the password.
`APPLE_ID_PASSWORD` is the password Apple created for the app.

The GitHub personal access token needs `repo` permissions.
See the docs on [how to create a personal access access token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) for more information.

The signing certificate shall be in the root folder of the repository.
The certificate password will be required during the signing process.
The signing process may take several minutes because notarization requieres uploading the app to Apple.

In order to verify that the application has been successfully signed and notarized, run:

```sh
# Verifies the app has been signed
codesign --verify --verbose ./dist/mac/Metronome\ Wallet.app

# Verifies the app has been notarized
spctl -a -t exec -vvv ./dist/mac/Metronome\ Wallet.app
```

#### Windows

To sign the application, a certificate for the Microsoft Authenticode platform is required.
The certificate, a `.p7b` file, will then be required during the build process.

Current provider is [DigiCert](https://www.digicert.com).

## License

MIT