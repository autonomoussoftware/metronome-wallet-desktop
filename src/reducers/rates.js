import { handleActions } from 'redux-actions'

const initialState = {}

const reducer = handleActions(
  {
    'eth-price-updated': (state, action) => ({
      ...state,
      [action.payload.token]: action.payload
    })
  },
  initialState
)

export default reducer
