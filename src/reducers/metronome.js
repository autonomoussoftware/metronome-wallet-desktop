import { handleActions } from 'redux-actions'

const initialState = {
  transferAllowed: null
}

const reducer = handleActions(
  {
    'metronome-token-status-updated': (state, action) => ({
      ...state,
      transferAllowed: Boolean(action.payload.transferAllowed)
    })
  },
  initialState
)

export default reducer
