import styled, { createGlobalStyle } from 'styled-components'
import withChainSelectorState from 'metronome-wallet-ui-logic/src/hocs/withChainSelectorState'
import * as ReachUI from '@reach/menu-button'
import PropTypes from 'prop-types'
import React from 'react'

import { DisplayValue } from '../common'

const GlobalStyles = createGlobalStyle`
  [data-reach-menu] {
    display: block;
    position: absolute;
    z-index: 4;
  }
`

const MenuButton = styled(ReachUI.MenuButton)`
  background-color: ${({ theme }) => theme.colors.lightShade};
  font: inherit;
  color: ${({ theme }) => theme.colors.light};
  border-radius: 1.2rem;
  border: none;
  padding: 1.6rem;
  text-align: left;
  display: block;
  width: 100%;
  cursor: pointer;

  &:focus,
  &:hover {
    background-color: ${({ theme }) => theme.colors.darkShade};
    outline: none;
  }

  &[aria-expanded='true'] {
    visibility: hidden;
  }
`

const MenuList = styled(ReachUI.MenuList)`
  box-shadow: 0 0 32px 0 rgba(0, 0, 0, 0.4);
  background-color: ${({ theme }) => theme.colors.dark};
  display: block;
  white-space: nowrap;
  outline: none;
  overflow: hidden;
  border-radius: 1.2rem;
  transform: translateY(-72px);
`

const MenuItem = styled(ReachUI.MenuItem)`
  background-color: ${({ theme }) => theme.colors.lightShade};
  display: block;
  cursor: pointer;
  padding: 1.6rem;

  &[data-selected] {
    background-color: ${({ theme }) => theme.colors.translucentPrimary};
    outline: none;
  }
`

const ChainName = styled.div`
  color: ${({ theme }) => theme.colors.light};
  font-size: 1.1rem;
  letter-spacing: 1.6px;
  font-weight: 600;
`

const Balance = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  letter-spacing: 1px;
  font-weight: 600;
`

class ChainSelector extends React.Component {
  static propTypes = {
    onChainChange: PropTypes.func.isRequired,
    activeChain: PropTypes.string.isRequired,
    chains: PropTypes.arrayOf(
      PropTypes.shape({
        displayName: PropTypes.string.isRequired,
        balance: PropTypes.string.isRequired,
        symbol: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired
      })
    ).isRequired
  }

  render() {
    const activeItem = this.props.chains.find(
      ({ id }) => id === this.props.activeChain
    )

    return (
      <React.Fragment>
        <ReachUI.Menu>
          <MenuButton>
            <ChainName>{activeItem.displayName}</ChainName>
            <Balance>
              <DisplayValue
                value={activeItem.balance}
                post={` ${activeItem.symbol}`}
              />
            </Balance>
          </MenuButton>
          <MenuList>
            <MenuItem
              onSelect={() => this.props.onChainChange(activeItem.id)}
              key={activeItem.id}
            >
              <ChainName>{activeItem.displayName}</ChainName>
              <div>
                <DisplayValue
                  value={activeItem.balance}
                  post={` ${activeItem.symbol}`}
                />
              </div>
            </MenuItem>
            {this.props.chains
              .filter(({ id }) => id !== this.props.activeChain)
              .map(chain => (
                <MenuItem
                  onSelect={() => this.props.onChainChange(chain.id)}
                  key={chain.id}
                >
                  <div>{chain.displayName}</div>
                  <div>
                    <DisplayValue
                      value={chain.balance}
                      post={` ${chain.symbol}`}
                    />
                  </div>
                </MenuItem>
              ))}
          </MenuList>
        </ReachUI.Menu>
        <GlobalStyles />
      </React.Fragment>
    )
  }
}

export default withChainSelectorState(ChainSelector)
