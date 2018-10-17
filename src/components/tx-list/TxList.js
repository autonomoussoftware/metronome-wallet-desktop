import { List as RVList, AutoSizer, WindowScroller } from 'react-virtualized'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import ScanningTxPlaceholder from './ScanningTxPlaceholder'
import { ItemFilter, Flex } from '../common'
import NoTxPlaceholder from './NoTxPlaceholder'
import * as selectors from '../../selectors'
import ScanIndicator from './ScanIndicator'
import ReceiptModal from './ReceiptModal'
import LogoIcon from '../icons/LogoIcon'
import TxRow from './TxRow'

const Container = styled.div`
  margin-top: 2.4rem;

  @media (min-width: 960px) {
    margin-top: 4.8rem;
  }
`

const Header = styled.div`
  position: sticky;
  background: ${p => p.theme.colors.primary};
  top: 4.8rem;
  left: 0;
  right: 0;
  z-index: 1;
  margin: 0 -4.8rem;
  padding: 0 4.8rem;

  @media (min-width: 1140px) {
    top: 7.1rem;
    display: flex;
    align-items: baseline;
  }
`

const Title = styled.div`
  line-height: 2.5rem;
  font-size: 2rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin-bottom: 2px;
  margin-right: 2.4rem;

  @media (min-width: 1140px) {
    margin-right: 0.8rem;
  }

  @media (min-width: 1200px) {
    margin-right: 1.6rem;
  }
`

const TabsContainer = styled.div`
  display: flex;
  justify-content: space-between;
`

const Tab = styled.button`
  font: inherit;
  line-height: 1.8rem;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  opacity: ${p => (p.isActive ? '1' : '0.5')};
  text-transform: uppercase;
  padding: 1.6rem 0.8rem;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  border-bottom: 2px solid ${p => (p.isActive ? 'white' : 'transparent')};
  margin-bottom: 1px;
  transition: 0.3s;
  &:focus {
    outline: none;
  }

  @media (min-width: 760px) {
    font-size: 1.4rem;
    padding: 1.6rem;
  }
`

const ListContainer = styled.div`
  border-radius: 2px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 ${p => p.theme.colors.darkShade};
`

const TxRowContainer = styled.div`
  &:hover {
    background-color: rgba(126, 97, 248, 0.1);
  }
`

const FooterLogo = styled.div`
  padding: 4.8rem 0;
  width: 3.2rem;
  margin: 0 auto;
`

class TxList extends React.Component {
  static propTypes = {
    isScanningTx: PropTypes.bool.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        transaction: PropTypes.shape({
          hash: PropTypes.string.isRequired
        }).isRequired
      })
    ).isRequired
  }

  state = {
    activeModal: null,
    selectedTx: null,
    isReady: false
  }

  componentDidMount() {
    // We need to grab the scrolling div (in <Router/>) to sync with react-virtualized scroll
    const element = document.querySelector('[data-scrollelement]')
    if (!element && process.env.NODE_ENV !== 'test') {
      throw new Error(
        "react-virtualized in transactions list requires the scrolling parent to have a 'data-scrollelement' attribute."
      )
    }
    // For tests, where this component is rendered in isolation, we default to window
    this.scrollElement = element || window
    this.setState({ isReady: true })
  }

  onTxClicked = ({ currentTarget }) => {
    this.setState({
      activeModal: 'receipt',
      selectedTx: currentTarget.dataset.hash
    })
  }

  onCloseModal = () => this.setState({ activeModal: null })

  rowRenderer = items => ({ key, style, index }) => (
    <TxRowContainer
      style={style}
      key={`${key}-${items[index].transaction.hash}`}
    >
      <TxRow
        data-testid="tx-row"
        data-hash={items[index].transaction.hash}
        onClick={this.onTxClicked}
        {...items[index]}
      />
    </TxRowContainer>
  )

  render() {
    const { isScanningTx, items } = this.props
    if (!this.state.isReady) return null
    return (
      <Container data-testid="tx-list">
        <ItemFilter extractValue={tx => tx.parsed.txType} items={items}>
          {({ filteredItems, onFilterChange, activeFilter }) => (
            <React.Fragment>
              <Header>
                <Flex.Row grow="1">
                  <Title>Transactions</Title>
                  {(items.length > 0 || !isScanningTx) && <ScanIndicator />}
                </Flex.Row>

                <TabsContainer>
                  <Tab
                    isActive={activeFilter === ''}
                    onClick={() => onFilterChange('')}
                  >
                    All
                  </Tab>
                  <Tab
                    isActive={activeFilter === 'sent'}
                    onClick={() => onFilterChange('sent')}
                  >
                    Sent
                  </Tab>
                  <Tab
                    isActive={activeFilter === 'received'}
                    onClick={() => onFilterChange('received')}
                  >
                    Received
                  </Tab>
                  <Tab
                    isActive={activeFilter === 'auction'}
                    onClick={() => onFilterChange('auction')}
                  >
                    Auction
                  </Tab>
                  <Tab
                    isActive={activeFilter === 'converted'}
                    onClick={() => onFilterChange('converted')}
                  >
                    Converted
                  </Tab>
                </TabsContainer>
              </Header>

              <ListContainer>
                {items.length === 0 &&
                  (isScanningTx ? (
                    <ScanningTxPlaceholder />
                  ) : (
                    <NoTxPlaceholder />
                  ))}
                <WindowScroller
                  // WindowScroller is required to sync window scroll with virtualized list scroll.
                  // scrollElement is required because in our layout we're scrolling a div, not window
                  scrollElement={this.scrollElement}
                >
                  {({ height, isScrolling, onChildScroll, scrollTop }) => {
                    if (!height) return null
                    return (
                      // AutoSizer is required to make virtualized rows have responsive width
                      <AutoSizer disableHeight>
                        {({ width }) => (
                          <RVList
                            rowRenderer={this.rowRenderer(filteredItems)}
                            isScrolling={isScrolling}
                            autoHeight
                            scrollTop={scrollTop}
                            rowHeight={65}
                            rowCount={filteredItems.length}
                            onScroll={onChildScroll}
                            height={height || 500} // defaults for tests
                            width={width || 500} // defaults for tests
                          />
                        )}
                      </AutoSizer>
                    )
                  }}
                </WindowScroller>
                <FooterLogo>
                  <LogoIcon />
                </FooterLogo>
              </ListContainer>
            </React.Fragment>
          )}
        </ItemFilter>
        <ReceiptModal
          onRequestClose={this.onCloseModal}
          isOpen={this.state.activeModal === 'receipt'}
          tx={items.find(tx => tx.transaction.hash === this.state.selectedTx)}
        />
      </Container>
    )
  }
}

const mapStateToProps = state => ({
  isScanningTx: selectors.getIsScanningTx(state),
  items: selectors.getActiveWalletTransactions(state)
})

export default connect(mapStateToProps)(TxList)
