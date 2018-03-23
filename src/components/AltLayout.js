import { Flex, Sp } from './common'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Banner from './Banner'
import React from 'react'

const Container = styled(Flex.Column)`
  min-height: 100vh;
  padding: 3.2rem;
  background: ${p => p.theme.colors.bg.dark} url('./images/pattern.png')
    repeat-x top center;
`

const Body = styled.div`
  max-width: 30rem;
  width: 100%;
  margin-top: 4rem;
  @media (min-height: 600px) {
    margin-top: 8rem;
  }
`

const Title = styled.div`
  line-height: 3rem;
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  @media (min-height: 600px) {
    font-size: 2.4rem;
  }
`

export default class AltLayout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string
  }

  render() {
    const { children, title } = this.props

    return (
      <Container align="center" {...this.props}>
        <Banner />
        <Body>
          {title && <Title>{title}</Title>}
          <Sp mt={2}>{children}</Sp>
        </Body>
      </Container>
    )
  }
}
