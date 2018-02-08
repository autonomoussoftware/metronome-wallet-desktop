import { createSelector } from 'reselect'
import settings from './config/settings'
import Web3 from 'web3'
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

export const getActiveWalletMtnBalance = createSelector(
  getActiveWalletAddresses,
  getActiveWalletData,
  (addresses, activeWallet) =>
    activeWallet && addresses && addresses.length > 0
      ? _.get(
          activeWallet,
          [
            'addresses',
            addresses[0],
            'token',
            settings.MTN_TOKEN_ADDR,
            'balance'
          ],
          null
        )
      : null
)

export const getRates = state => state.rates

export const getEthRate = createSelector(
  getRates,
  ({ ETH }) => (ETH ? ETH.price : null)
)

export const getMtnRate = createSelector(
  getRates,
  ({ MTN }) => (MTN ? MTN.price : null)
)

// Returns true if Main Process has sent enough data to render dashboard
export const hasEnoughData = createSelector(
  getActiveWalletEthBalance,
  getActiveWalletMtnBalance,
  getEthRate,
  (ethBalance, mtnBalance, ethRate) =>
    ethBalance !== null && mtnBalance !== null && ethRate !== null
)

export const getMtnBalanceWei = getActiveWalletMtnBalance

export const getMtnBalanceUSD = state => '0'

export const getEthBalanceWei = getActiveWalletEthBalance

export const getEthBalanceUSD = createSelector(
  getActiveWalletEthBalance,
  getEthRate,
  (balance, ethRate) => {
    if (!balance || !ethRate) return '0'
    const usdValue = parseFloat(Web3.utils.fromWei(balance)) * ethRate
    return usdValue.toFixed(usdValue > 100 ? 0 : 2)
  }
)

export const getAuction = state => state.auction

export const getAuctionStatus = createSelector(
  getAuction,
  auction => auction.status
)

export const getAuctionPriceUSD = createSelector(
  getAuctionStatus,
  getEthRate,
  (auctionStatus, ethRate) => {
    if (!auctionStatus || !ethRate) return '0'
    const usdValue =
      parseFloat(Web3.utils.fromWei(auctionStatus.currentPrice)) * ethRate
    return usdValue.toFixed(usdValue > 100 ? 0 : usdValue > 1 ? 2 : 6)
  }
)
