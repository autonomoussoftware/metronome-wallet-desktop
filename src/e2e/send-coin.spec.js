const { getHelpers } = require('./utils/helpers')
const { getApp } = require('./utils/app')
const {
  onboardWithCustomMnemonic,
  openSendDrawer,
  fillWizard
} = require('./utils/partials')

const app = getApp()

it('Sends coin in active chain', function() {
  const { waitText, click, get } = getHelpers(app)

  let toAddress

  return onboardWithCustomMnemonic(app, process.env.E2E_MNEMONIC)
    .then(() => waitText('My Wallet'))
    .then(() => get('address').getText())
    .then(text => (toAddress = text))
    .then(() => openSendDrawer(app))
    .then(() => click('coin-tab'))
    .then(() =>
      fillWizard(app, {
        form: 'sendCoin-form',
        fields: {
          'toAddress-field': toAddress,
          'coinAmount-field': '0.000000000000000001'
        }
      })
    )
})
