const { getApp, getHelpers } = require('./utils')

const app = getApp()

beforeEach(function() {
  return app.start()
})

afterEach(function() {
  if (app && app.isRunning()) {
    return app.stop()
  }
})

it('Onboards a new user recovering from mnemonic', function() {
  const { wipeDataAndRestart, waitText, fillField, testId } = getHelpers(app)
  const pass = process.env.E2E_PASSWORD

  return (
    // Remove all user data (persisted state, settings, etc) and restart
    wipeDataAndRestart()
      // Accept terms & conditions
      .then(() => waitText('Accept to Continue'))
      .then(() => testId('accept-terms-chb').click())
      .then(() => testId('accept-license-chb').click())
      .then(() => testId('accept-terms-btn').click())

      // define a password
      .then(() => waitText('Define a Password'))
      .then(() => fillField('pass-field', pass))
      .then(() => fillField('pass-again-field', pass))
      .then(() => app.client.$('[type=submit]').click())

      // select recover from user-provided mnemonic
      .then(() => waitText('Copy the following word list'))
      .then(() => testId('recover-btn').click())

      // insert user mnemonic
      .then(() => waitText('Enter a valid 12 word passphrase'))
      .then(() => fillField('mnemonic-field', process.env.E2E_MNEMONIC))
      .then(() => app.client.$('[type=submit]').click())

      // wait for loading screen
      .then(() => waitText('Gathering Information'))

      // restart app to verify correct onboarding
      .then(() => app.restart())
      .then(() => waitText('Enter your password'))
      .then(() => fillField('pass-field', pass))
      .then(() => app.client.$('[type=submit]').click())
      .then(() => waitText('Gathering Information'))
  )
})
