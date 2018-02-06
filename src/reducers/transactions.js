import { handleActions } from 'redux-actions'
import mockTransactions from '../services/tx-mock'

export const initialState = mockTransactions

const reducer = handleActions({}, initialState)

export default reducer
