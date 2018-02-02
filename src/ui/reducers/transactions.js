import { handleActions } from 'redux-actions';
// import actions from '../actions';

const initialState = [];

const reducer = handleActions(
  {
    // [actions.newTransaction]: (state, { payload }) => [payload, ...state]
  },
  initialState
);

export default reducer;
