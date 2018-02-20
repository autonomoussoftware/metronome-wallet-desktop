export default {
  MTN_TOKEN_ADDR:
    process.env.REACT_APP_MTN_TOKEN_ADDR ||
    '0xf583c8fe0cbf447727378e3b1e921b1ef81adda8',
  MTN_EXPLORER_URL:
    process.env.REACT_APP_MTN_EXPLORER_URL ||
    'http://explorer.mtn.bloqrock.net',
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN
}
