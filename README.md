[![Build Status](https://travis-ci.com/MetronomeToken/metronome-desktop-wallet.svg?token=zFtwnjoHbEAEPUQyswR1&branch=master)](https://travis-ci.com/MetronomeToken/metronome-desktop-wallet)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# Metronome Desktop Wallet
> 💻💰 Metronome wallet for desktop devices

## Install the project dependencies

```bash
$ npm i
```

## Run in development mode

```bash
$ npm run dev
```

## Create distribution bundle

```bash
$ npm run dist
```

## Create distribution bundle and publish it

```bash
npm run release
```

## Create base pack bundle without target any OS

```bash
$ npm run pack
```

## Logs

The log output is in the next directories:

 * **on Linux:** `~/.config/<app name>/log.log`
 * **on OS X:** `~/Library/Logs/<app name>/log.log`
 * **on Windows:** `%USERPROFILE%\AppData\Roaming\<app name>\log.log`

More info https://github.com/megahertz/electron-log

## Development notes

To remove the settings of the app and start again:

```
$ rm ~/Library/Application\ Support/metronome-desktop-wallet/Settings
```

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)
