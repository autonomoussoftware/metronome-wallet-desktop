const { getHelpers } = require('./helpers')

function acceptTerms(app) {
  const { waitText, click } = getHelpers(app)

  return waitText('Accept to Continue')
    .then(() => click('accept-terms-chb'))
    .then(() => click('accept-license-chb'))
    .then(() => click('accept-terms-btn'))
}

function definePassword(app) {
  const { submitForm, waitText, fillPassword } = getHelpers(app)

  return waitText('Define a Password')
    .then(() => fillPassword())
    .then(() => fillPassword('pass-again-field'))
    .then(() => submitForm('pass-form'))
}

function useGeneratedMnemonic(app) {
  const { submitForm, waitText, fillField, click, get } = getHelpers(app)
  let mnemonic

  return waitText('Copy the following word list')
    .then(() => get('mnemonic-label').getText())
    .then(text => (mnemonic = text))
    .then(() => click('copied-mnemonic-btn'))
    .then(() => waitText('enter the 12 words provided before'))
    .then(() => fillField('mnemonic-field', mnemonic))
    .then(() => submitForm('mnemonic-form'))
}

function useUserMnemonic(app, mnemonic) {
  const { submitForm, waitText, fillField, click } = getHelpers(app)

  return waitText('Copy the following word list')
    .then(() => click('recover-btn'))
    .then(() => waitText('Enter a valid 12 word passphrase'))
    .then(() => fillField('mnemonic-field', mnemonic))
    .then(() => submitForm('mnemonic-form'))
}

function onboardWithRandomMnemonic(app) {
  const { waitText } = getHelpers(app)

  return acceptTerms(app)
    .then(() => definePassword(app))
    .then(() => useGeneratedMnemonic(app))
    .then(() => waitText('Gathering Information'))
}

function onboardWithCustomMnemonic(app, mnemonic) {
  const { waitText } = getHelpers(app)

  return acceptTerms(app)
    .then(() => definePassword(app))
    .then(() => useUserMnemonic(app, mnemonic))
    .then(() => waitText('Gathering Information'))
}

function fillWizard(app, cfg) {
  const {
    expectInexistence,
    waitExistence,
    fillPassword,
    submitForm,
    fillField
  } = getHelpers(app)

  const { form, fields, timeout = 120000 } = cfg

  return Promise.all(
    Object.keys(fields).map(fieldName =>
      fillField(fieldName, fields[fieldName])
    )
  )
    .then(() => expectInexistence('confirm-form'))
    .then(() => submitForm(form))
    .then(() => waitExistence('confirm-form'))
    .then(() => fillPassword())
    .then(() => expectInexistence('waiting'))
    .then(() => submitForm('confirm-form'))
    .then(() => waitExistence('waiting'))
    .then(() => expectInexistence('success'))
    .then(() => waitExistence('success', timeout))
}

module.exports = {
  onboardWithCustomMnemonic,
  onboardWithRandomMnemonic,
  fillWizard
}
