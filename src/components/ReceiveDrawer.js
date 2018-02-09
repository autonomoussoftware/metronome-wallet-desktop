import { CopyIcon, BaseBtn, Drawer, Flex, Sp } from '../common'
import * as selectors from '../selectors'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import QRCode from 'qrcode.react'
import React from 'react'
const { clipboard } = window.require('electron')

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
  padding: 6.4rem 2.4rem;
  flex-grow: 1;
  height: 100%;
  align-items: center;
  justify-content: center;
  display: flex;
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

class Receive extends React.Component {
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
        isOpen={isOpen}
        title="Receive Transaction"
      >
        <Flex.Column grow="1">
          <Sp py={8} px={2}>
            <Flex.Column align="center">
              <Title>Your address</Title>
              <Address>{address}</Address>
              <CopyBtn onClick={this.onCopyToClipboardClick}>
                <CopyIcon />
              </CopyBtn>
              <BtnLabel isCopied={copyStatus !== 'init'}>
                {copyStatus === 'init' ? 'Copy' : 'Copied to clipboard!'}
              </BtnLabel>
            </Flex.Column>
          </Sp>
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

const mapStateToProps = state => ({
  address: selectors.getActiveWalletAddresses(state)[0]
})

export default connect(mapStateToProps)(Receive)
