import { handleActions } from 'redux-actions'
import mockTransactions from '../../services/tx-mock'

const initialState = mockTransactions

const reducer = handleActions({}, initialState)

export default reducer
