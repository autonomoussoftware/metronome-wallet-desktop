const electronPath = require('electron')
const Application = require('spectron').Application
const getPortSync = require('get-port-sync')
const rimraf = require('rimraf')
const crypto = require('crypto')
const tempy = require('tempy')
const path = require('path')

function getApp() {
  // Get a new user data directory for each test to avoid conflicts between them
  const tempUserDataPath = tempy.directory()

  // Get a free port for each test (required to run chromedriver concurrently)
  const freePort = getPortSync()

  // Use a random password for each test and make it accessible through env vars
  const randomPassword = crypto.randomBytes(16).toString('hex')

  const app = new Application({
    requireName: 'electronRequire',
    args: [path.join(__dirname, '../../..')],
    path: electronPath,
    port: freePort,
    env: {
      USER_DATA_PATH: tempUserDataPath,
      E2E_PASSWORD: randomPassword,
      NODE_ENV: 'test'
    }
  })

  beforeEach(function() {
    return app.start()
  })

  afterEach(async function() {
    if (app && app.isRunning()) await app.stop()
    // Remove temp user data directory
    rimraf.sync(tempUserDataPath)
  })

  return app
}

module.exports = { getApp }
