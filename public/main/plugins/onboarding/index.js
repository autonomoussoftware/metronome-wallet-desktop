'use strict'

const { getPasswordHash } = require('../../settings')

function onboardingStatus () {
  const onboardingComplete = !!getPasswordHash()
  return { onboardingComplete }
}

function init () {
  return {
    uiHooks: [{
      eventName: 'ui-ready',
      handler: onboardingStatus
    }]
  }
}

module.exports = { init }
