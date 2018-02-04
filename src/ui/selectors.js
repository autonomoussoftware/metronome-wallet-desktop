import { createSelector } from 'reselect'

export const getWallets = state => state.wallets.all
export const getActiveAddress = state => state.wallets.active

export const getActiveWallet = createSelector(
  getActiveAddress,
  getWallets,
  (active, wallets) => wallets[active]
)

// Returns true if Main Process has sent the wallet status on bootstrap
export const isReady = createSelector(getWallets, wallets => wallets !== null)

// Returns true if the wallet has at least one address
export const isInitialized = createSelector(
  getWallets,
  isReady,
  (wallets, isReady) => isReady && Object.keys(wallets).length > 0
)
