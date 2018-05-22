export default {
  MTN_TOKEN_ADDR:
    process.env.REACT_APP_MTN_TOKEN_ADDR ||
    '0xef532fb902299b97f789f25beb44a1c4a4502760',
  CONVERTER_ADDR:
    process.env.REACT_APP_CONVERTER_ADDR ||
    '0xc9b300800e7ffceb1cc68593fce4d4ff842d71db',
  MTN_EXPLORER_URL:
    process.env.REACT_APP_MTN_EXPLORER_URL ||
    'https://explorer.met.bloqrock.net',
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
  ETH_DEFAULT_GAS_LIMIT: '21000',
  MET_DEFAULT_GAS_LIMIT: '2000000',
  DEFAULT_GAS_PRICE: '1000000000'
}
