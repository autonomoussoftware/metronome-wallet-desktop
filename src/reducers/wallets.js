import { handleActions } from 'redux-actions'
import _ from 'lodash'

const initialState = {
  active: null,
  allIds: null,
  byId: null
}

const reducer = handleActions(
  {
    'create-wallet': (state, { payload }) => ({
      ...state,
      allIds: [...(state.allIds || []), payload.walletId],
      active: payload.walletId
    }),

    'open-wallets': (state, { payload }) => ({
      ...state,
      allIds: payload.walletIds,
      active: payload.walletIds[0] || null
    }),

    'wallet-state-changed': (state, { payload }) => ({
      ...state,
      byId: _.merge({}, state.byId || {}, payload)
    })
  },
  initialState
)

export default reducer
