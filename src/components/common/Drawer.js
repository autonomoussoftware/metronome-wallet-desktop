import styled, { injectGlobal } from 'styled-components'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import React from 'react'

import CloseIcon from '../icons/CloseIcon'

/**
 * There's no other way to override overlay states styles
 * so the sensible thing to do is to inject them here
 */
injectGlobal`
  body.ReactModal__Body--open {
    overflow: hidden;
  }
  .ReactModal__Overlay:before {
    content: "";
    position: fixed;
    top: 0; bottom: 0; left: 0; right: 0;
    display: block;
    transition: opacity 0.2s;
    will-change: opacity;
    background-color: rgba(30, 30, 30, 0.8);
    opacity: 0;
  }
  .ReactModal__Overlay.ReactModal__Overlay--after-open {
    overflow-x: hidden;
    overflow-y: auto;
  }
  .ReactModal__Overlay.ReactModal__Overlay--after-open:before {
    opacity: 1;
  }
  .ReactModal__Overlay.ReactModal__Overlay--before-close:before {
    opacity: 0;
    transition: opacity 0.6s;
  }
`

const Container = styled(Modal)`
  &.ReactModal__Content {
    transition: transform 0.6s;
    will-change: transform;
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
  font-size: 2rem;
  line-height: 2rem;
  font-weight: bold;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin: 0;

  @media (min-height: 700px) {
    font-size: 2.4rem;
    line-height: 3rem;
  }
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

export default class Drawer extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    'data-testid': PropTypes.string,
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
        ariaHideApp={process.env.NODE_ENV !== 'test'}
        isOpen={isOpen}
        style={{
          overlay: {
            backgroundColor: 'transparent',
            zIndex: '3'
          },
          content: {
            boxShadow: '0 0 16px 0 rgba(0, 0, 0, 0.2)',
            background: '#323232',
            flexDirection: 'column',
            borderRadius: '0',
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
            <Title data-testid="drawer-title">{title}</Title>
            <CloseButton
              data-testid="drawer-close-btn"
              onClick={onRequestClose}
            >
              <CloseIcon />
            </CloseButton>
          </Header>
        )}
        <div data-testid={this.props['data-testid']}>{children}</div>
      </Container>
    )
  }
}
