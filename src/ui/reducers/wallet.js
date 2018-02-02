import { handleActions } from 'redux-actions'
import transactions from './transactions'

const initialState = {
  transactions: transactions.initialState,
  MTNbalance: null,
  ETHbalance: null
}

const reducer = handleActions({}, initialState)

export default reducer
