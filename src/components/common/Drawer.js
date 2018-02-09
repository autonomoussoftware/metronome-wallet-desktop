import { default as styled, injectGlobal } from 'styled-components'
import CloseIcon from './CloseIcon'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import React from 'react'

/**
 * There's no other way to override overlay states styles
 * so the sensible thing to do is to inject them here
 */
injectGlobal`
  body.ReactModal__Body--open {
    overflow: hidden;
  }
  .ReactModal__Overlay {
    background-color: transparent !important;
    transition: 0.3s;
    z-index: 1;
  }
  .ReactModal__Overlay.ReactModal__Overlay--after-open {
    background-color: rgba(50, 50, 50, 0.8) !important;
  }
  .ReactModal__Overlay.ReactModal__Overlay--before-close {
    background-color: transparent !important;
    transition: 0.6s;
  }
`

const Container = styled(Modal)`
  &.ReactModal__Content {
    transition: 0.6s;
    transform: translate3d(100%, 0, 0);
  }
  &.ReactModal__Content--after-open {
    transform: translate3d(0, 0, 0);
  }

  &.ReactModal__Content--before-close {
    transform: translate3d(100%, 0, 0);
  }
`

const Header = styled.header`
  background-color: ${p => p.theme.colors.primary};
  padding: 1.7rem 2.4rem;
  box-shadow: 0 0 16px 0 ${p => p.theme.colors.darkShade};
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
`

const Title = styled.h1`
  font-size: 2.4rem;
  line-height: 3rem;
  font-weight: bold;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin: 0;
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  outline: none;
  cursor: pointer;
  &:hover {
    opacity: 0.5;
  }
`

Modal.setAppElement('#root')

export default class Drawer extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string
  }

  render() {
    const { onRequestClose, children, isOpen, title } = this.props

    return (
      <Container
        onRequestClose={onRequestClose}
        closeTimeoutMS={600}
        contentLabel="Modal"
        isOpen={isOpen}
        style={{
          content: {
            backgroundImage: 'linear-gradient(to bottom, #272727, #323232)',
            flexDirection: 'column',
            borderRadius: '0',
            boxShadow: '0 0 16px 0 rgba(0, 0, 0, 0.2)',
            overflowX: 'hidden',
            overflowY: 'auto',
            position: 'absolute',
            outline: 'none',
            display: 'flex',
            padding: '0',
            border: 'none',
            height: '100%',
            bottom: '0',
            width: '460px',
            right: '0',
            left: 'auto',
            top: '0'
          }
        }}
      >
        {title && (
          <Header>
            <Title>{title}</Title>
            <CloseButton onClick={onRequestClose}>
              <CloseIcon />
            </CloseButton>
          </Header>
        )}
        {children}
      </Container>
    )
  }
}
