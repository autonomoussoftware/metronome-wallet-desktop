const electronPath = require('electron')
const Application = require('spectron').Application
const rimraf = require('rimraf')
const tempy = require('tempy')
const path = require('path')

function getApp() {
  // Get a new user data directory for each test to avoid conflicts between them
  const tempUserDataPath = tempy.directory()

  const app = new Application({
    requireName: 'electronRequire',
    args: [path.join(__dirname, '../..')],
    path: electronPath,
    env: {
      USER_DATA_PATH: tempUserDataPath,
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

function getHelpers(app) {
  const waitText = (txt, container = 'body') =>
    app.client.waitUntilTextExists(container, txt)

  const testId = id => app.client.$(`[data-testid="${id}"]`)

  const fillField = (id, value) => testId(id).setValue(value)

  return {
    fillField,
    waitText,
    testId
  }
}

module.exports = {
  getHelpers,
  getApp
}
