import { combineReducers } from 'redux'
import converter from './converter'
import wallets from './wallets'
import auction from './auction'
import session from './session'

export default combineReducers({ converter, wallets, auction, session })
