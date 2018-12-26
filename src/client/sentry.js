import Raven from 'raven-js'

window.ipcRenderer.on('initial-state-received', (ev, { data }) => {
  const config = data.config
  console.warn(config)
  console.warn('About to configure sentry with DSN: ', config.SENTRY_DSN)
  if (config.SENTRY_DSN) {
    console.warn('About to configure sentry with DSN: ', config.SENTRY_DSN)
    Raven.config(config.SENTRY_DSN, {
      release: window.getAppVersion()
    }).install()
    window.addEventListener('unhandledrejection', e =>
      Raven.captureException(e.reason)
    )
  }
})
