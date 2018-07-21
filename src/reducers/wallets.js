import { handleActions } from 'redux-actions'
import _ from 'lodash'

const initialState = {
  isScanningTx: false,
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
      active: payload.activeWallet || payload.walletIds[0] || null
    }),

    'wallet-state-changed': (state, { payload }) => ({
      ...state,
      byId: _.mergeWith(
        {},
        state.byId || {},
        payload,
        (objValue, srcValue, key) => {
          if (key === 'transactions') {
            return _.unionBy(srcValue, objValue, 'transaction.hash')
          }
        }
      )
    }),

    'transactions-scan-started': (state, { payload }) => ({
      ...state,
      isScanningTx:
        payload.address === Object.keys(state.byId[state.active].addresses)[0]
          ? true
          : state.isScanningTx
    }),

    'transactions-scan-finished': (state, { payload }) => ({
      ...state,
      isScanningTx:
        payload.address === Object.keys(state.byId[state.active].addresses)[0]
          ? false
          : state.isScanningTx
    })
  },
  initialState
)

export default reducer
