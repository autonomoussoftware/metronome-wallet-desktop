const { getPasswordHash } = require('./settings')

function onboardingStatus () {
  const onboardingComplete = !!getPasswordHash()
  return { onboardingComplete }
}

function getHooks () {
  return [{
    eventName: 'ui-ready',
    handler: onboardingStatus
  }]
}

module.exports = { getHooks }
