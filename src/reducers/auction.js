import { handleActions } from 'redux-actions'

const initialState = {}

const reducer = handleActions(
  {
    'new-auction-status': (state, { payload }) => payload
  },
  initialState
)

export default reducer
