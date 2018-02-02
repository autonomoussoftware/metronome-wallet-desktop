import { handleActions } from "redux-actions"
// import actions from "../actions"

const initialState = {}

const reducer = handleActions(
  {
    // [actions.newConverterValues]: (state, { payload }) => payload
  },
  initialState
)

export default reducer
