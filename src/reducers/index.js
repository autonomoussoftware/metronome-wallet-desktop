import { combineReducers } from 'redux'
import connectivity from './connectivity'
import blockchain from './blockchain'
import converter from './converter'
import wallets from './wallets'
import auction from './auction'
import session from './session'
import rates from './rates'

export default combineReducers({
  connectivity,
  blockchain,
  converter,
  wallets,
  auction,
  session,
  rates
})
