const logger = require('electron-log')
const { app } = require('electron')
const Datastore = require('nedb')
const path = require('path')

let db

function initDatabase () {
  const dataPath = app.getPath('userData')

  db = new Datastore({
    filename: path.join(dataPath, 'EthereumBlockchainChache.db'),
    autoload: true
  })
}

function getDatabase () {
  return db
}

function clearDatabase () {
  logger.verbose('Database clear started')

  return new Promise((resolve, reject) => {
    db.remove({}, { multi: true }, function (err, numRemoved) {
      if (err) {
        logger.error('Database clear failed', err)
        return reject(err)
      }

      logger.verbose(`Database clear success, removed ${numRemoved} documents`)
      return resolve(numRemoved)
    })
  })
}

// TODO listen window events to stop and restart the coincap listener
module.exports = { initDatabase, getDatabase, clearDatabase }
