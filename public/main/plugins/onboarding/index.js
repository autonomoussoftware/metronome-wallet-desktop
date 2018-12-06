'use strict'

const { getPasswordHash } = require('../../client/settings')

function onboardingStatus () {
  const onboardingComplete = !!getPasswordHash()
  return { onboardingComplete }
}

const init = () => ({
  uiHooks: [{
    eventName: 'ui-ready',
    handler: onboardingStatus
  }]
})

module.exports = { init }
