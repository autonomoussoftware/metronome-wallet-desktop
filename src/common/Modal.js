import ReactModal from 'react-modal'
import CloseIcon from './CloseIcon'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import theme from '../theme'
import React from 'react'

const Container = styled(ReactModal)`
  &.ReactModal__Content {
    opacity: 0;
    transition: 0.3s;
    transform: translate3d(-50%, 10%, 0);
  }
  &.ReactModal__Content--after-open {
    opacity: 1;
    transform: translate3d(-50%, 0, 0);
  }

  &.ReactModal__Content--before-close {
    opacity: 0;
    transform: translate3d(-50%, -10%, 0);
  }
`

const Header = styled.header`
  padding: 1.6rem;
  display: flex;
  justify-content: ${p => (p.hasTitle ? 'space-between' : 'flex-end')};
  flex-shrink: 0;
`

const Title = styled.h1`
  font-size: 1.8rem;
  line-height: 2.4rem;
  font-weight: normal;
  color: ${p => p.theme.colors.copy};
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

export default class Modal extends React.Component {
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
            background: theme.colors.bg.white,
            flexDirection: 'column',
            borderRadius: '0',
            boxShadow: `0 0 16px 0 ${theme.colors.darkShade}`,
            overflowY: 'auto',
            position: 'absolute',
            outline: 'none',
            display: 'flex',
            padding: '0',
            border: 'none',
            width: '304px',
            right: 'auto',
            left: '50%',
            top: '10rem'
          }
        }}
      >
        <Header hasTitle={!!title}>
          {title && <Title>{title}</Title>}
          <CloseButton onClick={onRequestClose}>
            <CloseIcon color={theme.colors.copy} />
          </CloseButton>
        </Header>
        {children}
      </Container>
    )
  }
}
