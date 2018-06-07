import MetronomeContracts from 'metronome-contracts'

const addresses = MetronomeContracts.addresses[process.env.REACT_APP_ETH_CHAIN || 'ropsten']
const defaultExplorerUrl = 'https://explorer.met.bloqrock.net'

export default {
  MET_TOKEN_ADDR: addresses.metToken.toLowerCase(),
  CONVERTER_ADDR: addresses.autonomousConverter.toLowerCase(),
  MET_EXPLORER_URL: process.env.REACT_APP_MTN_EXPLORER_URL || defaultExplorerUrl,
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
  ETH_DEFAULT_GAS_LIMIT: '21000',
  MET_DEFAULT_GAS_LIMIT: '250000',
  DEFAULT_GAS_PRICE: '1000000000',
  MAX_GAS_PRICE: '20000000000000000' // ~= $12 USD
}
