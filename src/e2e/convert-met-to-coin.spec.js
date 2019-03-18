const { getHelpers } = require('./utils/helpers')
const { getApp } = require('./utils/app')
const {
  onboardWithCustomMnemonic,
  openConvertDrawer,
  fillWizard,
  navigateTo
} = require('./utils/partials')

const app = getApp()

it('Converts MET to coin in active chain', function() {
  const { waitText, click } = getHelpers(app)

  return onboardWithCustomMnemonic(app, process.env.E2E_MNEMONIC)
    .then(() => waitText('My Wallet'))
    .then(() => navigateTo(app, 'converter'))
    .then(() => openConvertDrawer(app))
    .then(() => click('met-tab'))
    .then(() => click('useMinimum-cb'))
    .then(() =>
      fillWizard(app, {
        form: 'metToCoin-form',
        fields: {
          'metAmount-field': '0.000000000000000001'
        }
      })
    )
})
