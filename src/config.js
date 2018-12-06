import MetronomeContracts from 'metronome-contracts'

const addresses =
  MetronomeContracts.addresses[process.env.REACT_APP_ETH_CHAIN || 'main']
const defaultExplorerUrl = 'https://explorer.metronome.io'

export default {
  MET_TOKEN_ADDR: addresses.metToken.toLowerCase(),
  CONVERTER_ADDR: addresses.autonomousConverter.toLowerCase(),
  MET_EXPLORER_URL:
    process.env.REACT_APP_MET_EXPLORER_URL || defaultExplorerUrl,
  SENTRY_DSN:
    null,
    // process.env.REACT_APP_SENTRY_DSN ||
    // 'https://d9905c2eec994071935593d4085d3547@sentry.io/290706',
  ETH_DEFAULT_GAS_LIMIT: '21000',
  MET_DEFAULT_GAS_LIMIT: '250000',
  DEFAULT_GAS_PRICE: '1000000000',
  MAX_GAS_PRICE: '20000000000000000', // ~= $12 USD
  REQUIRED_PASSWORD_ENTROPY: 72
}
