import * as testUtils from '../../testUtils'
import { Simulate } from 'react-testing-library'
import Auction from '../auction/Auction'
import React from 'react'

describe('<Auction/>', () => {
  it('displays a "waiting..." message until the first auction status is received', () => {
    const { queryByTestId, store } = testUtils.reduxRender(
      <Auction />,
      getInitialState()
    )
    expect(queryByTestId('waiting')).not.toBeNull()
    store.dispatch(auctionStatusUpdated(initialAuctionNotStarted()))
    expect(queryByTestId('waiting')).toBeNull()
  })

  describe('if we are on a DAILY auction', () => {
    it('displays a suitable title', () => {
      const { queryByTestId } = testUtils.reduxRender(
        <Auction />,
        getInitialState(inDailyAuction())
      )
      expect(queryByTestId('title').textContent).toBe(
        'Time Remaining in Auction'
      )
    })

    it('displays a time countdown until current DAILY auction ends', () => {
      const { queryByTestId } = testUtils.reduxRender(
        <Auction />,
        getInitialState(inDailyAuction())
      )
      expect(queryByTestId('countdown')).not.toBeNull()
    })

    it('displays stats', () => {
      const { queryByTestId } = testUtils.reduxRender(
        <Auction />,
        getInitialState(inDailyAuction())
      )
      expect(queryByTestId('stats')).not.toBeNull()
    })

    describe('if there are tokens available', () => {
      it('opens Buy drawer when Buy button is clicked', () => {
        const { queryByTestId, getByTestId } = testUtils.reduxRender(
          <Auction />,
          getInitialState(inDailyAuction({ tokenRemaining: '100' }))
        )
        const btn = testUtils.withDataset(getByTestId('buy-btn'), 'modal')
        expect(queryByTestId('buy-drawer')).toBeNull()
        Simulate.click(btn)
        expect(queryByTestId('buy-drawer')).not.toBeNull()
      })
    })

    describe('if auction is depleted', () => {
      it('Buy button is disabled', () => {
        const { queryByTestId, getByTestId, store } = testUtils.reduxRender(
          <Auction />,
          getInitialState(inDailyAuction({ tokenRemaining: '100' }))
        )
        store.dispatch(auctionStatusUpdated({ tokenRemaining: '0' }))
        const btn = testUtils.withDataset(getByTestId('buy-btn'), 'modal')
        expect(queryByTestId('buy-drawer')).toBeNull()
        Simulate.click(btn)
        expect(queryByTestId('buy-drawer')).toBeNull()
      })

      it('Buy button shows a tooltip when hovered', () => {
        const { getByTestId, store } = testUtils.reduxRender(
          <Auction />,
          getInitialState(inDailyAuction({ tokenRemaining: '100' }))
        )
        expect(getByTestId('buy-btn').getAttribute('data-rh')).toBeNull()
        store.dispatch(auctionStatusUpdated({ tokenRemaining: '0' }))
        expect(getByTestId('buy-btn').getAttribute('data-rh')).toBe(
          'No MET remaining in current auction'
        )
      })
    })

    describe('if connectivity is lost', () => {
      it('Buy button is disabled', () => {
        const { queryByTestId, getByTestId, store } = testUtils.reduxRender(
          <Auction />,
          getInitialState(inDailyAuction())
        )
        store.dispatch(goOffline())
        const btn = testUtils.withDataset(getByTestId('buy-btn'), 'modal')
        expect(queryByTestId('buy-drawer')).toBeNull()
        Simulate.click(btn)
        expect(queryByTestId('buy-drawer')).toBeNull()
      })

      it('Buy button shows a tooltip when hovered', () => {
        const { getByTestId, store } = testUtils.reduxRender(
          <Auction />,
          getInitialState(inDailyAuction())
        )
        expect(getByTestId('buy-btn').getAttribute('data-rh')).toBeNull()
        store.dispatch(goOffline())
        expect(getByTestId('buy-btn').getAttribute('data-rh')).toBe(
          "Can't buy while offline"
        )
      })
    })
  })
})

function auctionStatusUpdated(payload = {}) {
  return {
    type: 'auction-status-updated',
    payload
  }
}

function goOffline() {
  return {
    type: 'connectivity-state-changed',
    payload: { ok: false }
  }
}

const initialAuctionNotStarted = (overrides = {}) => ({
  nextAuctionStartTime: testUtils.inOneHour(),
  tokenRemaining: '1',
  currentAuction: 0,
  currentPrice: '33000000000',
  genesisTime: testUtils.inOneHour(),
  ...overrides
})

const inDailyAuction = (overrides = {}) => ({
  nextAuctionStartTime: testUtils.inOneHour(),
  tokenRemaining: '1',
  currentAuction: 10,
  currentPrice: '33000000000',
  genesisTime: testUtils.twoWeeksAgo(),
  ...overrides
})

function getInitialState(auctionStatus = null) {
  return testUtils.getInitialState({ auction: { status: auctionStatus } })
}
