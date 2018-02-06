import { createSelector } from 'reselect'

export const getWallets = state => state.wallets.all
export const getActiveWalletId = state => state.wallets.active

export const getActiveWalletData = createSelector(
  getActiveWalletId,
  getWallets,
  (activeId, wallets) => (activeId ? wallets[activeId] : {})
)

export const getActiveWalletAddresses = createSelector(
  getActiveWalletData,
  activeWallet => Object.keys(activeWallet.addresses || {})
)

export const getBalance = createSelector(
  getActiveWalletAddresses,
  getActiveWalletData,
  (addresses, activeWallet) =>
    activeWallet && addresses.length > 0
      ? activeWallet.addresses[addresses[0]].balance
      : null
)

// Returns true if Main Process has sent enough data to render dashboard
export const hasEnoughData = createSelector(
  getBalance,
  balance => balance !== null
)
