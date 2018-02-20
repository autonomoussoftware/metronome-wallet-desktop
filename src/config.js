export default {
  MTN_TOKEN_ADDR:
    process.env.REACT_APP_MTN_TOKEN_ADDR ||
    '0x4c00f8ec2d4fc3d9cbe4d7bd04d80780d5cae77f',
  MTN_EXPLORER_URL:
    process.env.REACT_APP_MTN_EXPLORER_URL ||
    'http://explorer.mtn.bloqrock.net',
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN
}
