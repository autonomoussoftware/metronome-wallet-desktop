# Metronome Desktop Wallet

## Install the project dependencies

In console:

```bash
npm install
```

## Run in development mode

Run in console:

```bash
npm run electron-dev
```

## Create distribution bundle

```bash
npm run electron-dist
```

## Create distribution bundle and publish it

```bash
npm run electron-release
```

## Create base pack bundle without target any OS

```bash
npm run electron-pack
```

# Logs

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
