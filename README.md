<h1 align="center">
  <img src="./public/images/banner.png" alt="Metronome Wallet Desktop" width="50%">
</h1>

💻💰 Metronome wallet for desktop devices

[![Build Status](https://travis-ci.com/MetronomeToken/metronome-desktop-wallet.svg?token=zFtwnjoHbEAEPUQyswR1&branch=master)](https://travis-ci.com/MetronomeToken/metronome-desktop-wallet)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Index

1.  [Requirements](#requirements)
1.  [Configuration](#configuration)
1.  [Dev Setup](#dev-Setup)
1.  [Prod Setup](#prod-setup)
1.  [Logs](#logs)
1.  [Development Notes](#development-notes)
1.  [License](#license)

## Requirements

* [Node.js](https://nodejs.org) v8 (or greater)

## Dev Setup

```bash
# Install dependencies
$ npm i

# Run dev mode
$ npm run dev

# Run test cases
$ npm test
```

## Prod Setup

```bash
# Run build process
$ npm run dist

# Run build process and publish to GitHub release
$ npm run release
```

## Logs

The log output is in the next directories:

 * **Linux:** `~/.config/<app name>/log.log`
 * **macOS:** `~/Library/Logs/<app name>/log.log`
 * **Windows:** `%USERPROFILE%\AppData\Roaming\<app name>\log.log`

> More info [github.com/megahertz/electron-log](https://github.com/megahertz/electron-log)

## Development Notes

To remove app settings and start over again:

* **Linux**:
  ```bash
  $ rm ~/Library/Application\ Support/metronome-desktop-wallet/Settings
  ```
* **macOS**:
  ```bash
  ```
* **Windows**:
  ```bash
  ```


## LICENSE

[MIT License](https://github.com/MetronomeToken/metronome-desktop-wallet/blob/develop/LICENSE).
