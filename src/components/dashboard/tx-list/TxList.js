import { List as RVList, AutoSizer, WindowScroller } from 'react-virtualized'
import withTxListState from 'metronome-wallet-ui-logic/src/hocs/withTxListState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import ScanningTxPlaceholder from './ScanningTxPlaceholder'
import NoTxPlaceholder from './NoTxPlaceholder'
import { ItemFilter } from '../../common'
import ReceiptModal from '../ReceiptModal'
import LogoIcon from '../../icons/LogoIcon'
import Header from './Header'
import TxRow from './row/Row'

const Container = styled.div`
  margin-top: 2.4rem;

  @media (min-width: 960px) {
    margin-top: 4.8rem;
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
    hasTransactions: PropTypes.bool.isRequired,
    syncStatus: PropTypes.oneOf(['up-to-date', 'syncing', 'failed']).isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        txType: PropTypes.string.isRequired,
        hash: PropTypes.string.isRequired
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
    <TxRowContainer style={style} key={`${key}-${items[index].hash}`}>
      <TxRow
        data-testid="tx-row"
        data-hash={items[index].hash}
        onClick={this.onTxClicked}
        tx={items[index]}
      />
    </TxRowContainer>
  )

  filterExtractValue = ({ txType }) =>
    ['imported', 'exported'].includes(txType) ? 'ported' : txType

  render() {
    if (!this.state.isReady) return null
    return (
      <Container data-testid="tx-list">
        <ItemFilter
          extractValue={this.filterExtractValue}
          items={this.props.items}
        >
          {({ filteredItems, onFilterChange, activeFilter }) => (
            <React.Fragment>
              <Header
                hasTransactions={this.props.hasTransactions}
                onFilterChange={onFilterChange}
                activeFilter={activeFilter}
                syncStatus={this.props.syncStatus}
              />

              <ListContainer>
                {!this.props.hasTransactions &&
                  (this.props.syncStatus === 'syncing' ? (
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
                            rowHeight={66}
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
          hash={this.state.selectedTx}
        />
      </Container>
    )
  }
}

export default withTxListState(TxList)
