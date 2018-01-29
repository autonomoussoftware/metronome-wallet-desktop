# Metronome Desktop Wallet

## Install the project dependencies

In console:

```
npm install
```

## Run in development mode

In console, start the React app:

```
npm run start
```

Wait for the development server to startup and then run:

```
npm run electron
```

## Create distribution bundle

In console, build the React app:

```
npm run build
```

Then follow these instructions https://electronjs.org/docs/tutorial/application-distribution
The files you need to copy are the following:

```
/build
/node_modules
electron-starter.js
package.json
```
