import { createSelector } from 'reselect'
import _ from 'lodash'

export const getPassword = state => state.session.password

export const sessionIsActive = createSelector(getPassword, pass => !!pass)

export const getWalletsById = state => state.wallets.byId
export const getActiveWalletId = state => state.wallets.active

export const getActiveWalletData = createSelector(
  getActiveWalletId,
  getWalletsById,
  (activeId, walletsById) => _.get(walletsById, [activeId], null)
)

export const getActiveWalletAddresses = createSelector(
  getActiveWalletData,
  activeWallet =>
    _.get(activeWallet, 'addresses', null)
      ? Object.keys(activeWallet.addresses)
      : null
)

export const getActiveWalletEthBalance = createSelector(
  getActiveWalletAddresses,
  getActiveWalletData,
  (addresses, activeWallet) =>
    activeWallet && addresses && addresses.length > 0
      ? activeWallet.addresses[addresses[0]].balance
      : null
)

export const getRates = state => state.rates

export const getEthRate = createSelector(getRates, rates => rates.ETH)

export const getMtnRate = createSelector(getRates, rates => rates.MTN)

// Returns true if Main Process has sent enough data to render dashboard
export const hasEnoughData = createSelector(
  getActiveWalletEthBalance,
  getEthRate,
  (ethBalance, ethRate) => ethBalance !== null && !!ethRate
)

export const getMtnBalanceWei = state => 0

export const getMtnBalanceUSD = state => 0

export const getEthBalanceWei = getActiveWalletEthBalance

export const getEthBalanceUSD = createSelector(
  getActiveWalletEthBalance,
  getEthRate,
  (balance, rate) => (balance && rate ? balance * rate.price : 0)
)
