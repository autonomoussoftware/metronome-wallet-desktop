const { getHelpers } = require('./utils/helpers')
const { getApp } = require('./utils/app')
const {
  onboardWithCustomMnemonic,
  openBuyDrawer,
  fillWizard,
  navigateTo
} = require('./utils/partials')

const app = getApp()

it('Buys MET in active chain auction', function() {
  const { waitText } = getHelpers(app)

  return onboardWithCustomMnemonic(app, process.env.E2E_MNEMONIC)
    .then(() => waitText('My Wallet'))
    .then(() => navigateTo(app, 'auction'))
    .then(() => openBuyDrawer(app))
    .then(() =>
      fillWizard(app, {
        form: 'buy-form',
        fields: {
          'coinAmount-field': '0.000000000000000001'
        }
      })
    )
})
