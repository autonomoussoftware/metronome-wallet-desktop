import { handleActions } from 'redux-actions'

const initialState = {
  isOnline: true
}

const reducer = handleActions(
  {
    'connectivity-state-changed': (state, action) => ({
      ...state,
      isOnline: Boolean(action.payload.ok)
    })
  },
  initialState
)

export default reducer
