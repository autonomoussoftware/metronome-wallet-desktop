import { handleActions } from 'redux-actions'
import config from '../config'

const initialState = {
  gasPrice: config.DEFAULT_GAS_PRICE,
  height: null
}

const reducer = handleActions(
  {
    'eth-block': (state, { payload }) => ({
      ...state,
      height: payload.number
    }),
    'gas-price-updated': (state, { payload }) => ({
      ...state,
      gasPrice: payload
    })
  },
  initialState
)

export default reducer
