import { handleActions } from 'redux-actions'

const initialState = {
  status: null
}

const reducer = handleActions(
  {
    'auction-status-updated': (state, { payload }) => ({
      ...state,
      status: { ...state.status, ...payload }
    })
  },
  initialState
)

export default reducer
