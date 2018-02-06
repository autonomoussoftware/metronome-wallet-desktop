import { createSelector } from 'reselect'

export const getWallets = state => state.wallets.all
export const getActiveAddress = state => state.wallets.active

export const getActiveWallet = createSelector(
  getActiveAddress,
  getWallets,
  (active, wallets) => wallets[active]
)

// Returns true if Main Process has sent enough data to render dashboard
export const hasEnoughData = createSelector(
  getWallets,
  wallets => wallets !== null
)
