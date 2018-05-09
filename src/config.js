export default {
  MTN_TOKEN_ADDR:
    process.env.REACT_APP_MTN_TOKEN_ADDR ||
    '0xe0df19e55ebbbe076c3e393ff5d0418a2a0de5f8',
  CONVERTER_ADDR:
    process.env.REACT_APP_CONVERTER_ADDR ||
    '0x6d0cb3142e66f5f3cf196b1df32082bf5f3325d3',
  MTN_EXPLORER_URL:
    process.env.REACT_APP_MTN_EXPLORER_URL ||
    'https://explorer.met.bloqrock.net',
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
  ETH_DEFAULT_GAS_LIMIT: '21000',
  MET_DEFAULT_GAS_LIMIT: '2000000',
  DEFAULT_GAS_PRICE: '1000000000'
}
