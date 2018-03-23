import { reduxRender, testModalIsCalled } from '../../testUtils'
import Auction from '../Auction'
import config from '../../config'
import React from 'react'

describe('<Auction/>', () => {
  it('displays a "waiting..." message until the first auction status is received', () => {
    const { queryByTestId, store } = reduxRender(<Auction />)
    expect(queryByTestId('waiting')).not.toBeNull()
    store.dispatch(auctionStatusUpdated(initialAuctionNotStarted()))
    expect(queryByTestId('waiting')).toBeNull()
  })

  describe('if INITIAL auction is NOT STARTED yet', () => {
    it('displays a suitable title', () => {
      const { queryByTestId } = reduxRender(
        <Auction />,
        getInitialState(initialAuctionNotStarted())
      )
      expect(queryByTestId('title').textContent).toBe(
        'Initial Auction starts in'
      )
    })

    it('displays a time countdown until genesis time', () => {
      const { queryByTestId } = reduxRender(
        <Auction />,
        getInitialState(initialAuctionNotStarted())
      )
      expect(queryByTestId('countdown')).not.toBeNull()
    })

    it('do NOT display stats and Buy button', () => {
      const { queryByTestId } = reduxRender(
        <Auction />,
        getInitialState(initialAuctionNotStarted())
      )
      expect(queryByTestId('stats')).toBeNull()
      expect(queryByTestId('buy-btn')).toBeNull()
    })
  })

  describe('if we are on the INITIAL auction', () => {
    it('displays a suitable title', () => {
      const { queryByTestId } = reduxRender(
        <Auction />,
        getInitialState(inInitialAuction())
      )
      expect(queryByTestId('title').textContent).toBe(
        'Time Remaining in Initial Auction'
      )
    })

    it('displays a time countdown until INITIAL auction ends', () => {
      const { queryByTestId } = reduxRender(
        <Auction />,
        getInitialState(inInitialAuction())
      )
      expect(queryByTestId('countdown')).not.toBeNull()
    })

    it('displays stats', () => {
      const { queryByTestId } = reduxRender(
        <Auction />,
        getInitialState(inInitialAuction())
      )
      expect(queryByTestId('stats')).not.toBeNull()
    })

    describe('if there are tokens available', () => {
      it('opens Buy drawer when Buy button is clicked', () => {
        const { getByTestId } = reduxRender(
          <Auction />,
          getInitialState(inInitialAuction({ tokenRemaining: '100' }))
        )
        testModalIsCalled(getByTestId, 'buy-btn', 'buy-drawer')
      })
    })

    describe('if auction is depleted', () => {
      it('Buy button is disabled', () => {
        const { getByTestId, store } = reduxRender(
          <Auction />,
          getInitialState(inInitialAuction({ tokenRemaining: '100' }))
        )
        store.dispatch(auctionStatusUpdated({ tokenRemaining: '0' }))
        testModalIsCalled(getByTestId, 'buy-btn', 'buy-drawer', false)
      })

      it('Buy button shows a tooltip when hovered', () => {
        const { getByTestId, store } = reduxRender(
          <Auction />,
          getInitialState(inInitialAuction({ tokenRemaining: '100' }))
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
        const { getByTestId, store } = reduxRender(
          <Auction />,
          getInitialState(inInitialAuction())
        )
        store.dispatch(goOffline())
        testModalIsCalled(getByTestId, 'buy-btn', 'buy-drawer', false)
      })

      it('Buy button shows a tooltip when hovered', () => {
        const { getByTestId, store } = reduxRender(
          <Auction />,
          getInitialState(inInitialAuction())
        )
        expect(getByTestId('buy-btn').getAttribute('data-rh')).toBeNull()
        store.dispatch(goOffline())
        expect(getByTestId('buy-btn').getAttribute('data-rh')).toBe(
          "Can't buy while offline"
        )
      })
    })
  })

  describe('if we are IN BETWEEN auctions', () => {
    it('displays a suitable title', () => {
      const { queryByTestId } = reduxRender(
        <Auction />,
        getInitialState(inBetweenAuctions())
      )
      expect(queryByTestId('title').textContent).toBe('Initial Auction ended')
    })

    it('do NOT display stats and Buy button', () => {
      const { queryByTestId } = reduxRender(
        <Auction />,
        getInitialState(inBetweenAuctions())
      )
      expect(queryByTestId('stats')).toBeNull()
      expect(queryByTestId('buy-btn')).toBeNull()
    })

    it('displays a "waiting..." message until the first daily auction starts', () => {
      const { queryByTestId } = reduxRender(
        <Auction />,
        getInitialState(inBetweenAuctions())
      )
      expect(queryByTestId('waiting-next')).not.toBeNull()
    })
  })

  describe('if we are on a DAILY auction', () => {
    it('displays a suitable title', () => {
      const { queryByTestId } = reduxRender(
        <Auction />,
        getInitialState(inDailyAuction())
      )
      expect(queryByTestId('title').textContent).toBe(
        'Time Remaining in Daily Auction'
      )
    })

    it('displays a time countdown until current DAILY auction ends', () => {
      const { queryByTestId } = reduxRender(
        <Auction />,
        getInitialState(inDailyAuction())
      )
      expect(queryByTestId('countdown')).not.toBeNull()
    })

    it('displays stats', () => {
      const { queryByTestId } = reduxRender(
        <Auction />,
        getInitialState(inDailyAuction())
      )
      expect(queryByTestId('stats')).not.toBeNull()
    })

    describe('if there are tokens available', () => {
      it('opens Buy drawer when Buy button is clicked', () => {
        const { getByTestId } = reduxRender(
          <Auction />,
          getInitialState(inDailyAuction({ tokenRemaining: '100' }))
        )
        testModalIsCalled(getByTestId, 'buy-btn', 'buy-drawer')
      })
    })

    describe('if auction is depleted', () => {
      it('Buy button is disabled', () => {
        const { getByTestId, store } = reduxRender(
          <Auction />,
          getInitialState(inDailyAuction({ tokenRemaining: '100' }))
        )
        store.dispatch(auctionStatusUpdated({ tokenRemaining: '0' }))
        testModalIsCalled(getByTestId, 'buy-btn', 'buy-drawer', false)
      })

      it('Buy button shows a tooltip when hovered', () => {
        const { getByTestId, store } = reduxRender(
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
        const { getByTestId, store } = reduxRender(
          <Auction />,
          getInitialState(inDailyAuction())
        )
        store.dispatch(goOffline())
        testModalIsCalled(getByTestId, 'buy-btn', 'buy-drawer', false)
      })

      it('Buy button shows a tooltip when hovered', () => {
        const { getByTestId, store } = reduxRender(
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

const twoWeeksAgo = () => Date.now() / 1000 - 60 * 60 * 24 * 7 * 2
const oneHourAgo = () => Date.now() / 1000 - 60 * 60
const inOneHour = () => Date.now() / 1000 + 60 * 60
const inOneWeek = () => Date.now() / 1000 + 60 * 60 * 24 * 7

const initialAuctionNotStarted = (other = {}) => ({
  nextAuctionStartTime: inOneHour(),
  tokenRemaining: '1',
  currentAuction: '0',
  currentPrice: '33000000000',
  genesisTime: inOneHour(),
  ...other
})

const inInitialAuction = (other = {}) => ({
  nextAuctionStartTime: inOneWeek(),
  tokenRemaining: '1',
  currentAuction: '0',
  currentPrice: '33000000000',
  genesisTime: oneHourAgo(),
  ...other
})

const inBetweenAuctions = (other = {}) => ({
  nextAuctionStartTime: inOneHour(),
  tokenRemaining: '1',
  currentAuction: '0',
  currentPrice: '33000000000',
  genesisTime: twoWeeksAgo(),
  ...other
})

const inDailyAuction = (other = {}) => ({
  nextAuctionStartTime: inOneHour(),
  tokenRemaining: '1',
  currentAuction: '10',
  currentPrice: '33000000000',
  genesisTime: twoWeeksAgo(),
  ...other
})

function getInitialState(auctionStatus = null) {
  return {
    connectivity: { isOnline: true },
    blockchain: { height: 1 },
    metronome: { transferAllowed: true },
    converter: { status: null },
    auction: { status: auctionStatus },
    session: { isLoggedIn: true },
    rates: { ETH: { token: 'ETH', price: 1 } },
    wallets: {
      active: 'foo',
      allIds: ['foo'],
      byId: {
        foo: {
          addresses: {
            '0xf00': {
              token: { [config.MTN_TOKEN_ADDR]: { balance: '1' } },
              balance: '1'
            }
          }
        }
      }
    }
  }
}
