import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Container = styled.div`
  min-height: 100%;
  background-image: ${p => p.theme.colors.bg.darkGradient};
  border-left: 2px solid rgb(46, 46, 46);
`

const Header = styled.header`
  padding: 2.4rem;
  background-color: ${p => p.theme.colors.bg.dark};
  box-shadow: 0 2px 2px 0 ${p => p.theme.colors.lightShade};

  @media (min-width: 800px) {
    padding: 2.4rem 4.8rem;
  }
`

const Title = styled.h1`
  margin: 0;
  line-height: 3rem;
  font-size: 2.4rem;
`

const DarkLayout = props => {
  const { children, title, ...other } = props

  return (
    <Container {...other}>
      <Header>
        <Title>{title}</Title>
      </Header>
      {children}
    </Container>
  )
}

DarkLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired
}

export default DarkLayout
