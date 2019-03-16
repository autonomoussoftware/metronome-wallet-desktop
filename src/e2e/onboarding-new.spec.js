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

it('Onboards a new user with generated mnemonic', function() {
  const { wipeDataAndRestart, waitText, fillField, testId } = getHelpers(app)
  const pass = process.env.E2E_PASSWORD
  let mnemonic

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

      // copy the provided mnemonic
      .then(() => waitText('Copy the following word list'))
      .then(() => testId('mnemonic-label').getText())
      .then(text => (mnemonic = text))
      .then(() => testId('copied-mnemonic-btn').click())

      // paste provided mnemonic
      .then(() => waitText('enter the 12 words provided before'))
      .then(() => fillField('mnemonic-field', mnemonic))
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
