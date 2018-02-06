import { handleActions } from 'redux-actions'

const initialState = {
  password: null
}

const reducer = handleActions(
  {
    'session-started': (state, action) => ({
      ...state,
      password: action.payload.password
    })
  },
  initialState
)

export default reducer
