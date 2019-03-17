const { onboardWithRandomMnemonic } = require('./utils/partials')
const { getHelpers } = require('./utils/helpers')
const { getApp } = require('./utils/app')

const app = getApp()

it('Onboards a new user with generated mnemonic', function() {
  const { waitText, submitForm, fillPassword } = getHelpers(app)

  return onboardWithRandomMnemonic(app)
    .then(() => app.restart())
    .then(() => waitText('Enter your password'))
    .then(() => fillPassword())
    .then(() => submitForm('login-form'))
    .then(() => waitText('Gathering Information'))
})
