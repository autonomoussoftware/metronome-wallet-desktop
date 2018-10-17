import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import QRCode from 'qrcode.react'
import React from 'react'
import Web3 from 'web3'

import { BaseBtn, Drawer, Flex } from '../common'
import * as selectors from '../../selectors'
import CopyIcon from '../icons/CopyIcon'

const { clipboard } = window.require('electron')

const Body = styled.div`
  padding: 3.2rem 1.6rem;

  @media (min-height: 700px) {
    padding: 6.4rem 1.6rem;
  }
`

const Title = styled.div`
  line-height: 2rem;
  font-size: 1.6rem;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

const Address = styled.div`
  margin-top: 1.6rem;
  padding: 0.8rem 1.6rem;
  border-radius: 4px;
  background-color: ${p => p.theme.colors.lightShade};
  line-height: 1.6rem;
  font-size: 1.3rem;
  letter-spacing: 0.5px;
  font-weight: 600;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  letter-spacing: normal;
`

const CopyBtn = styled(BaseBtn)`
  margin-top: 2.4rem;
  border: 0;
  padding: 0;
  font: inherit;
  width: 6.4rem;
  height: 6.4rem;
  border-radius: 3.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(126, 97, 248, 0.4);
  &:hover {
    background-color: rgba(126, 97, 248, 1);
  }
`

const BtnLabel = styled.div`
  opacity: ${p => (p.isCopied ? '1' : '0.5')};
  margin-top: 0.8rem;
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-shadow: 0 2px 0 ${p => p.theme.colors.darkShade};
`

const Footer = styled.div`
  background-image: linear-gradient(to bottom, #272727, #323232);
  padding: 3.2rem 2.4rem;
  flex-grow: 1;
  height: 100%;
  align-items: center;
  justify-content: center;
  display: flex;

  @media (min-height: 700px) {
    padding: 6.4rem 2.4rem;
  }
`

const QRContainer = styled.div`
  background: white;
  padding: 1.6rem;

  & canvas {
    display: block;
  }
`

const QRmsg = styled.div`
  text-align: center;
  margin-bottom: -4rem;
  margin-top: 2.4rem;
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

class ReceiveDrawer extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    address: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired
  }

  state = {
    copyStatus: 'init'
  }

  onCopyToClipboardClick = () => {
    clipboard.writeText(this.props.address)
    this.setState({ copyStatus: 'copied' })
  }

  render() {
    const { onRequestClose, address, isOpen } = this.props
    const { copyStatus } = this.state

    return (
      <Drawer
        onRequestClose={onRequestClose}
        data-testid="receive-drawer"
        isOpen={isOpen}
        title="Receive Transaction"
      >
        <Flex.Column grow="1">
          <Body>
            <Flex.Column align="center">
              <Title>Your address</Title>
              <Address data-testid="address">{address}</Address>
              <CopyBtn
                data-testid="copy-btn"
                onClick={this.onCopyToClipboardClick}
              >
                <CopyIcon />
              </CopyBtn>
              <BtnLabel
                data-testid="btn-label"
                isCopied={copyStatus !== 'init'}
              >
                {copyStatus === 'init' ? 'Copy' : 'Copied to clipboard!'}
              </BtnLabel>
            </Flex.Column>
          </Body>
          <Footer>
            <QRContainer>
              <QRCode value={address} />
              <QRmsg>Scan address</QRmsg>
            </QRContainer>
          </Footer>
        </Flex.Column>
      </Drawer>
    )
  }
}

const mapStateToProps = state => {
  const address = selectors.getActiveWalletAddresses(state)[0]
  return {
    address: address ? Web3.utils.toChecksumAddress(address) : address
  }
}

export default connect(mapStateToProps)(ReceiveDrawer)
