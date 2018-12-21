import Raven from 'raven-js'
const { ipcRenderer } = window.require('electron')

ipcRenderer.on('initial-state-received', (ev, { data }) => {
  const config = data.config
  console.warn(config)
  console.warn('About to configure sentry with DSN: ', config.SENTRY_DSN)
  if (config.SENTRY_DSN) {
    console.warn('About to configure sentry with DSN: ', config.SENTRY_DSN)
    Raven.config(config.SENTRY_DSN, {
      release: window.require('electron').remote.app.getVersion()
    }).install()
    window.addEventListener('unhandledrejection', e =>
      Raven.captureException(e.reason)
    )
  }
})


