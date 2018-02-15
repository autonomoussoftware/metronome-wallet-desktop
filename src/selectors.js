import { createSelector } from 'reselect'
import config from './config'
import Web3 from 'web3'
import _ from 'lodash'

function getTxType(meta, tokenData, transaction, address) {
  if (_.get(meta, 'metronome.auction')) {
    return 'auction'
  } else if (_.get(meta, 'metronome.converter')) {
    return 'converted'
  } else if (
    (!tokenData &&
      transaction.from &&
      transaction.from.toLowerCase() === address) ||
    (tokenData && tokenData.from && tokenData.from.toLowerCase() === address)
  ) {
    return 'sent'
  } else if (
    (!tokenData &&
      transaction.to &&
      transaction.to.toLowerCase() === address) ||
    (tokenData && tokenData.to && tokenData.to.toLowerCase() === address)
  ) {
    return 'received'
  }

  return 'unknown'
}

export const getIsLoggedIn = state => state.session.isLoggedIn

export const isSessionActive = createSelector(getIsLoggedIn, pass => !!pass)

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
      ? activeWallet.addresses[addresses[0]].balance || null
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
            config.MTN_TOKEN_ADDR,
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

export const getMtnBalanceWei = getActiveWalletMtnBalance

export const getMtnBalanceUSD = state => '0'

export const getEthBalanceWei = getActiveWalletEthBalance

export const getEthBalanceUSD = createSelector(
  getActiveWalletEthBalance,
  getEthRate,
  (balance, ethRate) => {
    if (!balance || !ethRate) return '0'
    const usdValue = parseFloat(Web3.utils.fromWei(balance)) * ethRate
    return usdValue.toFixed(usdValue > 1 ? 2 : 6)
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
    return usdValue.toFixed(usdValue > 1 ? 2 : 6)
  }
)

export const getConverter = state => state.converter

export const getConverterStatus = createSelector(
  getConverter,
  converter => converter.status
)

export const getConverterPriceUSD = createSelector(
  getConverterStatus,
  getEthRate,
  (converterStatus, ethRate) => {
    if (!converterStatus || !ethRate) return '0'
    const usdValue =
      parseFloat(Web3.utils.fromWei(converterStatus.currentPrice)) * ethRate
    return usdValue.toFixed(usdValue > 1 ? 2 : 6)
  }
)

export const getBlockchain = state => state.blockchain

export const getBlockHeight = createSelector(
  getBlockchain,
  blockchain => blockchain.height
)

export const getTxConfirmations = createSelector(
  getBlockHeight,
  (state, props) => props.transaction.blockNumber,
  (blockHeight, txBlockNumber) =>
    txBlockNumber === null || txBlockNumber > blockHeight
      ? 0
      : blockHeight - txBlockNumber + 1
)

export const getActiveWalletTransactions = createSelector(
  getActiveWalletAddresses,
  getActiveWalletData,
  getBlockHeight,
  (addresses, activeWallet, blockHeight) => {
    const txs =
      activeWallet && addresses && addresses.length > 0
        ? activeWallet.addresses[addresses[0]].transactions || []
        : []

    function parseTx({ transaction, receipt, meta }) {
      const tokenData = Object.values(meta.tokens || {})[0] || null

      const myAddress =
        activeWallet && addresses && addresses.length > 0
          ? addresses[0].toLowerCase()
          : ''

      const txType = getTxType(meta, tokenData, transaction, myAddress)

      const from =
        txType === 'received' && tokenData
          ? tokenData.from.toLowerCase()
          : transaction.from.toLowerCase()

      const to =
        txType === 'sent' && tokenData
          ? tokenData.to.toLowerCase()
          : transaction.to.toLowerCase()

      const value =
        ['received', 'sent'].includes(txType) && tokenData
          ? tokenData.value
          : transaction.value

      const ethSpentInAuction = txType === 'auction' ? transaction.value : null

      const mtnBoughtInAuction =
        txType === 'auction' && transaction.blockHash ? tokenData.value : null

      const symbol = ['received', 'sent'].includes(txType)
        ? tokenData ? 'MTN' : 'ETH'
        : null

      return {
        transaction,
        receipt,
        parsed: {
          mtnBoughtInAuction,
          ethSpentInAuction,
          txType,
          symbol,
          value,
          from,
          to
        }
      }
    }

    return _.sortBy(txs, 'transaction.blockNumber')
      .reverse()
      .map(parseTx)
  }
)

// Returns true if Main Process has sent enough data to render dashboard
export const hasEnoughData = createSelector(
  getActiveWalletEthBalance,
  getActiveWalletMtnBalance,
  getBlockHeight,
  getEthRate,
  (ethBalance, mtnBalance, blockHeight, ethRate) =>
    ethBalance !== null &&
    mtnBalance !== null &&
    ethRate !== null &&
    blockHeight !== null
)
