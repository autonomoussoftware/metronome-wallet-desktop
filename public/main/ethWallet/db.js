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

module.exports = { initDatabase, getDatabase }
