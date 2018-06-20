import * as testUtils from '../../testUtils'
import { Simulate } from 'react-testing-library'
import Converter from '../Converter'
import React from 'react'

describe.skip('<Converter/>', () => {
  it('displays a "waiting..." message until the first converter status is received', () => {
    const { queryByTestId, store } = testUtils.reduxRender(<Converter />)
    expect(queryByTestId('waiting')).not.toBeNull()
    store.dispatch(converterStatusUpdated(dummyStatus()))
    expect(queryByTestId('waiting')).toBeNull()
  })

  describe('If MET conversions are NOT ALLOWED yet', () => {
    it('displays stats', () => {
      const { queryByTestId } = testUtils.reduxRender(
        <Converter />,
        getInitialState(dummyStatus(), inInitialAuction(), false)
      )
      expect(queryByTestId('stats')).not.toBeNull()
    })

    it('Convert button is disabled', () => {
      const { getByTestId, queryByTestId } = testUtils.reduxRender(
        <Converter />,
        getInitialState(dummyStatus(), inDailyAuction(), false)
      )
      const btn = testUtils.withDataset(getByTestId('convert-btn'), 'modal')
      expect(queryByTestId('convert-drawer')).toBeNull()
      Simulate.click(btn)
      expect(queryByTestId('convert-drawer')).toBeNull()
    })

    it('Convert button shows a tooltip when hovered', () => {
      const { getByTestId, store } = testUtils.reduxRender(
        <Converter />,
        getInitialState(dummyStatus(), inDailyAuction())
      )
      expect(getByTestId('convert-btn').getAttribute('data-rh')).toBeNull()
      store.dispatch(transferAllowed(false))
      expect(getByTestId('convert-btn').getAttribute('data-rh')).toBe(
        'MET conversions not enabled yet'
      )
    })
  })

  describe('If MET conversions ARE ALLOWED', () => {
    it('opens Convert drawer when Convert button is clicked', () => {
      const { queryByTestId, getByTestId } = testUtils.reduxRender(
        <Converter />,
        getInitialState(dummyStatus(), inDailyAuction())
      )
      const btn = testUtils.withDataset(getByTestId('convert-btn'), 'modal')
      expect(queryByTestId('convert-drawer')).toBeNull()
      Simulate.click(btn)
      expect(queryByTestId('convert-drawer')).not.toBeNull()
    })

    describe('if we are on the INITIAL AUCTION', () => {
      it('displays stats', () => {
        const { queryByTestId } = testUtils.reduxRender(
          <Converter />,
          getInitialState(dummyStatus(), inInitialAuction())
        )
        expect(queryByTestId('stats')).not.toBeNull()
      })

      it('Convert button is disabled', () => {
        const { getByTestId, queryByTestId } = testUtils.reduxRender(
          <Converter />,
          getInitialState(dummyStatus(), inInitialAuction())
        )
        const btn = testUtils.withDataset(getByTestId('convert-btn'), 'modal')
        expect(queryByTestId('convert-drawer')).toBeNull()
        Simulate.click(btn)
        expect(queryByTestId('convert-drawer')).toBeNull()
      })

      it('Convert button shows a tooltip when hovered', () => {
        const { getByTestId } = testUtils.reduxRender(
          <Converter />,
          getInitialState(dummyStatus(), inInitialAuction())
        )
        expect(getByTestId('convert-btn').getAttribute('data-rh')).toBe(
          'Conversions are disabled during Initial Auction'
        )
      })
    })

    describe('if connectivity is lost', () => {
      it('Convert button is disabled', () => {
        const { queryByTestId, getByTestId, store } = testUtils.reduxRender(
          <Converter />,
          getInitialState(dummyStatus(), inDailyAuction())
        )
        store.dispatch(goOffline())
        const btn = testUtils.withDataset(getByTestId('convert-btn'), 'modal')
        expect(queryByTestId('convert-drawer')).toBeNull()
        Simulate.click(btn)
        expect(queryByTestId('convert-drawer')).toBeNull()
      })

      it('Convert button shows a tooltip when hovered', () => {
        const { getByTestId, store } = testUtils.reduxRender(
          <Converter />,
          getInitialState(dummyStatus(), inDailyAuction())
        )
        expect(getByTestId('convert-btn').getAttribute('data-rh')).toBeNull()
        store.dispatch(goOffline())
        expect(getByTestId('convert-btn').getAttribute('data-rh')).toBe(
          "Can't convert while offline"
        )
      })
    })
  })
})

function transferAllowed(value) {
  return {
    type: 'metronome-token-status-updated',
    payload: { transferAllowed: value }
  }
}

function converterStatusUpdated(payload = {}) {
  return {
    type: 'mtn-converter-status-updated',
    payload
  }
}

function goOffline() {
  return {
    type: 'connectivity-state-changed',
    payload: { ok: false }
  }
}

const dummyStatus = (overrides = {}) => ({
  availableEth: '100',
  availableMtn: '100',
  currentPrice: '10',
  ...overrides
})

const inInitialAuction = (overrides = {}) => ({
  nextAuctionStartTime: testUtils.inOneWeek(),
  tokenRemaining: '1',
  currentAuction: '0',
  currentPrice: '33000000000',
  genesisTime: testUtils.oneHourAgo(),
  ...overrides
})

const inDailyAuction = (overrides = {}) => ({
  nextAuctionStartTime: testUtils.inOneHour(),
  tokenRemaining: '1',
  currentAuction: '10',
  currentPrice: '33000000000',
  genesisTime: testUtils.twoWeeksAgo(),
  ...overrides
})

function getInitialState(
  converterStatus = null,
  auctionStatus = null,
  transferAllowed = true
) {
  return testUtils.getInitialState({
    metronome: { transferAllowed },
    converter: { status: converterStatus },
    auction: { status: auctionStatus }
  })
}
