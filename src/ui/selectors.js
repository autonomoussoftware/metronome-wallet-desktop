import { createSelector } from 'reselect'

export const getWallets = state => state.wallets.all
export const getActiveWalletId = state => state.wallets.active

export const getActiveWallet = createSelector(
  getActiveWalletId,
  getWallets,
  (activeId, wallets) => (activeId ? wallets[activeId] : null)
)

export const getActiveWalletBalances = createSelector(
  getActiveWallet,
  activeWallet => (activeWallet ? activeWallet.balance : null)
)

// Returns true if Main Process has sent enough data to render dashboard
export const hasEnoughData = createSelector(
  getActiveWalletBalances,
  getWallets,
  (balances, wallets) => wallets !== null && !!balances
)
