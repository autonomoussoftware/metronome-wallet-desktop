import { handleActions } from 'redux-actions'

const initialState = {
  isLoggedIn: false
}

const reducer = handleActions(
  {
    'session-started': (state, action) => ({
      ...state,
      isLoggedIn: true
    })
  },
  initialState
)

export default reducer
