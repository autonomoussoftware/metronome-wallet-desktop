const { onboardWithCustomMnemonic } = require('./utils/partials')
const { getHelpers } = require('./utils/helpers')
const { getApp } = require('./utils/app')

const app = getApp()

it('Onboards a new user recovering from mnemonic', function() {
  const { waitText, fillPassword, submitForm } = getHelpers(app)

  return onboardWithCustomMnemonic(app, process.env.E2E_MNEMONIC)
    .then(() => app.restart())
    .then(() => waitText('Enter your password'))
    .then(() => fillPassword())
    .then(() => submitForm('login-form'))
    .then(() => waitText('Gathering Information'))
})
