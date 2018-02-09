import { handleActions } from 'redux-actions'

const initialState = {
  status: null
}

const reducer = handleActions(
  {
    'mtn-converter-status-updated': (state, { payload }) => ({
      ...state,
      status: payload
    })
  },
  initialState
)

export default reducer
