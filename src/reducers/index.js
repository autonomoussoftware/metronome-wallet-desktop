import { combineReducers } from 'redux'
import converter from './converter'
import wallets from './wallets'
import auction from './auction'

export default combineReducers({ converter, wallets, auction })
