import { handleActions } from 'redux-actions'

const initialState = {
  height: null
}

const reducer = handleActions(
  {
    'eth-block': (state, { payload }) => ({
      ...state,
      height: payload.number
    })
  },
  initialState
)

export default reducer
