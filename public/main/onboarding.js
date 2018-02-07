const settings = require('electron-settings')

function onboardingStatus () {
  const onboardingComplete = !!settings.get('user.passwordHash')
  return { onboardingComplete }
}

function getHooks () {
  return [{
    eventName: 'ui-ready',
    handler: onboardingStatus
  }]
}

module.exports = { getHooks }
