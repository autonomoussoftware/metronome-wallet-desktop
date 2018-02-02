import { handleActions } from "redux-actions"
import transactions from "./transactions"
// import actions from '../actions';

const initialState = {
  transactions: transactions.initialState,
  MTNbalance: null,
  ETHbalance: null
}

const reducer = handleActions(
  {
    // [actions.newAuctionStatus]: (state, { payload }) => payload
  },
  initialState
)

export default reducer
