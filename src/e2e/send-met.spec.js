const { onboardWithCustomMnemonic, fillWizard } = require('./utils/partials')
const { getHelpers } = require('./utils/helpers')
const { getApp } = require('./utils/app')

const app = getApp()

it('Sends MET in active chain', function() {
  const { expectInexistence, waitExistence, waitText, click, get } = getHelpers(
    app
  )

  let toAddress

  return onboardWithCustomMnemonic(app, process.env.E2E_MNEMONIC)
    .then(() => waitText('My Wallet'))
    .then(() => get('address').getText())
    .then(text => (toAddress = text))
    .then(() => expectInexistence('send-drawer'))
    .then(() => click('send-btn'))
    .then(() => waitExistence('send-drawer'))
    .then(() => click('met-tab'))
    .then(() =>
      fillWizard(app, {
        form: 'sendMet-form',
        fields: {
          'toAddress-field': toAddress,
          'metAmount-field': '0.000000000000000001'
        }
      })
    )
})
