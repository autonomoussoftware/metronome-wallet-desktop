const electronPath = require('electron')
const Application = require('spectron').Application
const rimraf = require('rimraf')
const path = require('path')

function getApp() {
  return new Application({
    requireName: 'electronRequire',
    args: [path.join(__dirname, '../..')],
    path: electronPath
  })
}

function getHelpers(app) {
  const waitText = (txt, container = 'body') =>
    app.client.waitUntilTextExists(container, txt)

  const testId = id => app.client.$(`[data-testid="${id}"]`)

  const fillField = (id, value) => testId(id).setValue(value)

  const wipeDataAndRestart = () =>
    app.electron.remote.app
      .getPath('userData')
      .then(userDataPath => rimraf.sync(userDataPath))
      .then(() => app.restart())

  return { wipeDataAndRestart, fillField, waitText, testId }
}

module.exports = {
  getHelpers,
  getApp
}
