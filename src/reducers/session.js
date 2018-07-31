import { handleActions } from 'redux-actions'

const initialState = {
  hasEnoughData: false,
  isLoggedIn: false
}

const reducer = handleActions(
  {
    'session-started': (state, action) => ({
      ...state,
      isLoggedIn: true
    }),
    'required-data-gathered': (state, action) => ({
      ...state,
      hasEnoughData: true
    })
  },
  initialState
)

export default reducer
