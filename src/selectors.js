import { createSelector } from 'reselect'
import * as utils from './utils'
import config from './config'
import Web3 from 'web3'
import _ from 'lodash'

const hasFunds = val => val && Web3.utils.toBN(val).gt(Web3.utils.toBN(0))

// eslint-disable-next-line complexity
function getTxType(meta, tokenData, transaction, address) {
  if (_.get(meta, 'metronome.auction')) {
    return 'auction'
  } else if (_.get(meta, 'metronome.converter')) {
    return 'converted'
  } else if (
    (!tokenData &&
      transaction.from &&
      transaction.from.toLowerCase() === address) ||
    (tokenData && tokenData.from && tokenData.from.toLowerCase() === address) ||
    (tokenData &&
      tokenData.processing &&
      transaction.from.toLowerCase() === address)
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

export const getConnectivity = state => state.connectivity

export const getIsOnline = createSelector(
  getConnectivity,
  connectivityStatus => connectivityStatus.isOnline
)

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
            config.MET_TOKEN_ADDR,
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

// TODO implement when we have a definition about MTN:USD rate
export const getMtnBalanceUSD = () => '0'

export const getEthBalanceWei = getActiveWalletEthBalance

export const getEthBalanceUSD = createSelector(
  getActiveWalletEthBalance,
  getEthRate,
  (balance, ethRate) => {
    if (!balance || !ethRate) return '0'
    return utils.getUSDequivalent(balance, ethRate)
  }
)

export const getAuction = state => state.auction

export const getAuctionStatus = createSelector(
  getAuction,
  auction => auction.status
)

export const getCurrentAuction = createSelector(
  getAuctionStatus,
  auctionStatus =>
    auctionStatus && auctionStatus.currentAuction
      ? auctionStatus.currentAuction
      : '-1'
)

export const getIsInitialAuction = createSelector(
  getCurrentAuction,
  currentAuction => parseInt(currentAuction, 10) === 0
)

export const getAuctionPriceUSD = createSelector(
  getAuctionStatus,
  getEthRate,
  (auctionStatus, ethRate) => {
    if (!auctionStatus || !ethRate) return '$0.00 (USD)'
    return utils.getUSDequivalent(auctionStatus.currentPrice, ethRate)
  }
)

export const getConverter = state => state.converter

export const getConverterStatus = createSelector(
  getConverter,
  converter => converter.status
)

export const getConverterPrice = createSelector(
  getConverterStatus,
  converterStatus => _.get(converterStatus, 'currentPrice', null)
)

export const getConverterPriceUSD = createSelector(
  getConverterStatus,
  getEthRate,
  (converterStatus, ethRate) => {
    if (!converterStatus || !ethRate) return '$0.00 (USD)'
    return utils.getUSDequivalent(converterStatus.currentPrice, ethRate)
  }
)

export const getBlockchain = state => state.blockchain

export const getBlockHeight = createSelector(
  getBlockchain,
  blockchain => blockchain.height
)

export const getNetworkGasPrice = createSelector(
  getBlockchain,
  blockchain => blockchain.gasPrice
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
  (addresses, activeWallet) => {
    const txs =
      activeWallet && addresses && addresses.length > 0
        ? activeWallet.addresses[addresses[0]].transactions || []
        : []

    // eslint-disable-next-line complexity
    function parseTx({ transaction, receipt, meta }) {
      const tokenData = Object.values(meta.tokens || {})[0] || null

      const isProcessing = tokenData && tokenData.processing

      const myAddress =
        activeWallet && addresses && addresses.length > 0
          ? addresses[0].toLowerCase()
          : ''

      const txType = getTxType(meta, tokenData, transaction, myAddress)

      const from =
        txType === 'received' && tokenData && tokenData.from
          ? tokenData.from.toLowerCase()
          : transaction.from
            ? transaction.from.toLowerCase()
            : null

      const to =
        txType === 'sent' && tokenData && tokenData.to
          ? tokenData.to.toLowerCase()
          : transaction.to
            ? transaction.to.toLowerCase()
            : null

      const value =
        ['received', 'sent'].includes(txType) && tokenData && tokenData.value
          ? tokenData.value
          : transaction.value

      const ethSpentInAuction =
        txType === 'auction' && meta
          ? Web3.utils
              .toBN(transaction.value)
              .sub(Web3.utils.toBN(meta.returnedValue || 0))
              .toString(10)
          : null

      const mtnBoughtInAuction =
        txType === 'auction' && transaction.blockHash && tokenData
          ? tokenData.value
          : null

      const symbol = ['received', 'sent'].includes(txType)
        ? tokenData
          ? 'MET'
          : 'ETH'
        : null

      const contractCallFailed = meta.contractCallFailed || false

      const convertedFrom =
        txType === 'converted'
          ? Web3.utils.toBN(transaction.value).isZero()
            ? 'MET'
            : 'ETH'
          : null

      const fromValue = convertedFrom
        ? convertedFrom === 'ETH'
          ? transaction.value
          : tokenData
            ? tokenData.value
            : null
        : null

      const toValue =
        convertedFrom && tokenData && meta
          ? convertedFrom === 'ETH'
            ? tokenData.value
            : meta.returnedValue
          : null

      const isApproval =
        !!tokenData &&
        tokenData.event === 'Approval' &&
        !Web3.utils.toBN(tokenData.value).isZero()

      const isCancelApproval =
        !!tokenData &&
        tokenData.event === 'Approval' &&
        Web3.utils.toBN(tokenData.value).isZero()

      const approvedValue =
        tokenData && tokenData.event === 'Approval' ? tokenData.value : null

      return {
        transaction,
        receipt,
        meta,
        parsed: {
          mtnBoughtInAuction,
          contractCallFailed,
          ethSpentInAuction,
          isCancelApproval,
          convertedFrom,
          approvedValue,
          isProcessing,
          isApproval,
          fromValue,
          toValue,
          txType,
          symbol,
          value,
          from,
          to
        }
      }
    }

    return _.sortBy(txs, [
      'transaction.blockNumber',
      'transaction.transactionIndex'
    ])
      .reverse()
      .map(parseTx)
  }
)

export const metronomeStatus = state => state.metronome

// Returns true if Main Process has sent enough data to render dashboard
export const hasEnoughData = createSelector(
  getActiveWalletEthBalance,
  getActiveWalletMtnBalance,
  getBlockHeight,
  getEthRate,
  // eslint-disable-next-line max-params
  (ethBalance, mtnBalance, blockHeight, ethRate) =>
    blockHeight !== null &&
    ethBalance !== null &&
    mtnBalance !== null &&
    ethRate !== null
)

export const sendFeatureStatus = createSelector(
  getActiveWalletEthBalance,
  getActiveWalletMtnBalance,
  getIsOnline,
  (ethBalance, mtnBalance, isOnline) => {
    return !isOnline
      ? 'offline'
      : !hasFunds(ethBalance) && !hasFunds(mtnBalance)
        ? 'no-funds'
        : 'ok'
  }
)

export const sendMetFeatureStatus = createSelector(
  getActiveWalletMtnBalance,
  getIsInitialAuction,
  getIsOnline,
  (mtnBalance, isInitialAuction, isOnline) => {
    return !isOnline
      ? 'offline'
      : !hasFunds(mtnBalance)
        ? 'no-funds'
        : isInitialAuction
          ? 'in-initial-auction'
          : 'ok'
  }
)

export const buyFeatureStatus = createSelector(
  getAuctionStatus,
  getIsOnline,
  (auctionStatus, isOnline) => {
    const isDepleted =
      auctionStatus &&
      auctionStatus.tokenRemaining &&
      !Web3.utils.toBN(auctionStatus.tokenRemaining).gt(Web3.utils.toBN(0))
    return !isOnline ? 'offline' : isDepleted ? 'depleted' : 'ok'
  }
)

// Returns the converter status in general. Useful for disabling "Convert" modal
export const convertFeatureStatus = createSelector(
  getActiveWalletEthBalance,
  getIsInitialAuction,
  getIsOnline,
  (ethBalance, isInitialAuction, isOnline) => {
    return !isOnline
      ? 'offline'
      : isInitialAuction
        ? 'in-initial-auction'
        : !hasFunds(ethBalance)
          ? 'no-eth'
          : 'ok'
  }
)

// Returns the conversion from ETH status. Useful for disabling "ETH -> MET" tab
export const convertEthFeatureStatus = createSelector(
  getActiveWalletEthBalance,
  ethBalance => {
    return hasFunds(ethBalance) ? 'ok' : 'no-eth'
  }
)

// Returns the conversion from MET status. Useful for disabling "MET -> ETH" tab
export const convertMetFeatureStatus = createSelector(
  getActiveWalletEthBalance,
  getActiveWalletMtnBalance,
  (ethBalance, metBalance) => {
    return !hasFunds(ethBalance)
      ? 'no-eth'
      : !hasFunds(metBalance)
        ? 'no-met'
        : 'ok'
  }
)
