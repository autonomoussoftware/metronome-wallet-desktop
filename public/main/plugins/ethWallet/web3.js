const settings = require('electron-settings')
const Web3 = require('web3')

let web3

function getWeb3 () {
  if (!web3) {
    const websocketApiUrl = settings.get('app.node.websocketApiUrl')
    web3 = new Web3(new Web3.providers.WebsocketProvider(websocketApiUrl))
  }
  return web3
}

module.exports = getWeb3
