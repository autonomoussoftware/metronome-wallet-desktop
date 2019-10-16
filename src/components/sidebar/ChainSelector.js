import styled, { createGlobalStyle, css } from 'styled-components'
import withChainSelectorState from 'metronome-wallet-ui-logic/src/hocs/withChainSelectorState'
import * as ReachUI from '@reach/menu-button'
import PropTypes from 'prop-types'
import React from 'react'

import { DisplayValue, Flex } from '../common'
import CaretIcon from '../icons/CaretIcon'
import CoinIcon from '../icons/CoinIcon'

const wideOrHover = styles => ({ parent }) => css`
  ${parent}:hover & {
    ${styles};
  }
  @media (min-width: 800px) {
    ${styles};
  }
`

const GlobalStyles = createGlobalStyle`
  [data-reach-menu] {
    display: block;
    position: absolute;
    z-index: 4;
    width: 168px;
  }
`

const Title = styled.div`
  color: ${({ theme }) => theme.colors.light};
  font-size: 0.9rem;
  letter-spacing: 1.6px;
  font-weight: 600;
  opacity: 0.5;
  margin-bottom: 0.8rem;
  margin-left: 0.6rem;
`

const MenuButton = styled(ReachUI.MenuButton)`
  background-color: ${({ theme }) => theme.colors.lightShade};
  font: inherit;
  color: ${({ theme }) => theme.colors.light};
  border-radius: 1.2rem;
  border: none;
  text-align: left;
  display: block;
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0.4rem 1rem 0.8rem;
  transition: padding 0.3s;

  &:focus,
  &:hover {
    background-color: ${({ theme }) => theme.colors.darkShade};
    outline: none;
  }

  &[aria-expanded='true'] {
    visibility: hidden;
  }

  ${wideOrHover`
    justify-content: center;
    padding: 1.6rem 1.2rem;
  `};
`

const MenuList = styled(ReachUI.MenuList)`
  box-shadow: 0 0 32px 0 rgba(0, 0, 0, 0.4);
  background-color: ${({ theme }) => theme.colors.dark};
  display: block;
  white-space: nowrap;
  outline: none;
  overflow: hidden;
  border-radius: 1.2rem;
  transform: translateY(-56px);
`

const MenuItem = styled(ReachUI.MenuItem)`
  background-color: ${({ theme }) => theme.colors.lightShade};
  display: block;
  cursor: pointer;
  padding: 1.6rem 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &[data-selected] {
    background-color: ${({ theme }) => theme.colors.translucentPrimary};
    outline: none;
  }

  @media (min-width: 800px) {
    justify-content: center;
  }
`

const Icon = styled(CoinIcon)`
  opacity: 0.8;
  transition: opacity 0.3s;
  height: 2.4rem;
  width: 2rem;
  transition: width 0.3s, opacity 0.3s;

  [data-reach-menu-item] &,
  ${MenuButton}:focus &,
  ${MenuButton}:hover & {
    opacity: 1;
  }

  ${wideOrHover`
    width: 2.4rem;
  `};
`

const ItemBody = styled(Flex.Item)`
  overflow: hidden;
  margin: 0;
  opacity: 0;
  transition: opacity 0.3s, margin 0.3s;

  [data-reach-menu-item] & {
    opacity: 1;
    margin-left: 0.8rem;
    margin-right: 0.4rem;
  }

  ${wideOrHover`
    opacity: 1;
    margin-left: 0.8rem;
    margin-right: 0.4rem;
  `};
`

const ChainName = styled.div`
  color: ${({ theme }) => theme.colors.light};
  font-size: 1.1rem;
  line-height: 1.4rem;
  letter-spacing: 1.6px;
  font-weight: 600;
  margin-top: -2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Balance = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  line-height: 1.4rem;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: -2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Caret = styled(CaretIcon)`
  transform: scaleY(${({ caret }) => (caret === 'up' ? -1 : 1)});
  opacity: ${({ caret }) => (caret === 'none' ? 0 : 0.5)};
  transition: opacity 0.3s;

  [data-reach-menu-item] &,
  ${MenuButton}:focus &,
  ${MenuButton}:hover & {
    opacity: ${({ caret }) => (caret === 'none' ? 0 : 1)};
  }
`

class ChainSelector extends React.Component {
  static propTypes = {
    onChainChange: PropTypes.func.isRequired,
    activeChain: PropTypes.string.isRequired,
    parent: PropTypes.object.isRequired,
    chains: PropTypes.arrayOf(
      PropTypes.shape({
        displayName: PropTypes.string.isRequired,
        balance: PropTypes.string.isRequired,
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
        <Title parent={this.props.parent}>CHAIN</Title>
        <ReachUI.Menu>
          <MenuButton parent={this.props.parent}>
            <Item {...activeItem} caret="down" parent={this.props.parent} />
          </MenuButton>
          <MenuList>
            <MenuItem
              onSelect={() => this.props.onChainChange(activeItem.id)}
              key={activeItem.id}
            >
              <Item {...activeItem} caret="up" />
            </MenuItem>
            {this.props.chains
              .filter(({ id }) => id !== this.props.activeChain)
              .map(chain => (
                <MenuItem
                  onSelect={() => this.props.onChainChange(chain.id)}
                  key={chain.id}
                >
                  <Item {...chain} caret="none" />
                </MenuItem>
              ))}
          </MenuList>
        </ReachUI.Menu>
        <GlobalStyles />
      </React.Fragment>
    )
  }
}

const Item = ({ displayName, balance, id, caret, parent }) => (
  <React.Fragment>
    <Flex.Item>
      <Icon coin={id} />
    </Flex.Item>
    <ItemBody grow="1" shrink="1" parent={parent}>
      <ChainName>{displayName}</ChainName>
      <Balance>
        <DisplayValue value={balance} post=" MET" />
      </Balance>
    </ItemBody>
    <Flex.Item shrink="0">
      <Caret caret={caret} />
    </Flex.Item>
  </React.Fragment>
)

Item.propTypes = {
  displayName: PropTypes.string.isRequired,
  balance: PropTypes.string.isRequired,
  parent: PropTypes.object,
  caret: PropTypes.oneOf(['up', 'down', 'none']).isRequired,
  id: PropTypes.string.isRequired
}

export default withChainSelectorState(ChainSelector)
