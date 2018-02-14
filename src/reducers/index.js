import { combineReducers } from 'redux'
import blockchain from './blockchain'
import converter from './converter'
import wallets from './wallets'
import auction from './auction'
import session from './session'
import rates from './rates'

export default combineReducers({
  blockchain,
  converter,
  wallets,
  auction,
  session,
  rates
})
