export default {
  MTN_TOKEN_ADDR:
    process.env.REACT_APP_MTN_TOKEN_ADDR ||
    '0x4c00f8ec2d4fc3d9cbe4d7bd04d80780d5cae77f',
  CONVERTER_ADDR:
    process.env.REACT_APP_CONVERTER_ADDR ||
    '0x94f1b0296ecbf02a8e4cf4ceab2fb6234b88c9fb',
  MTN_EXPLORER_URL:
    process.env.REACT_APP_MTN_EXPLORER_URL ||
    'http://explorer.mtn.bloqrock.net',
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
  ETH_DEFAULT_GAS_LIMIT: 21000,
  MET_DEFAULT_GAS_LIMIT: 2000000,
  DEFAULT_GAS_PRICE: 1000000000
}
