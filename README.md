<h1 align="center">
  <img src="./public/images/banner.png" alt="Metronome Wallet Desktop" width="50%">
</h1>

💻💰 Metronome Wallet for desktop computers

[![Build Status](https://travis-ci.com/autonomoussoftware/metronome-wallet-desktop.svg?branch=master)](https://travis-ci.com/autonomoussoftware/metronome-wallet-desktop)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![Metronome Desktop Wallet](https://metronome.io/images/metronome-apps-demo@2x.png)

## Development

### Requirements

* [Node.js](https://nodejs.org) LTS (v8)

### Launch

```bash
# Install dependencies
npm i

# Run dev mode
npm run dev
```

### Logs

The log output is in the next directories:

* **Linux:** `~/.config/<app name>/log.log`
* **macOS:** `~/Library/Logs/<app name>/log.log`
* **Windows:** `%USERPROFILE%\AppData\Roaming\<app name>\log.log`

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

To sign the macOS installers, execute `npm run dist:mac`.
The signing certificate shall be in the root folder and be named `met.p12`.
The certificate password will be required before signing.

## License

MIT
