import styled from 'styled-components'
import React from 'react'

// import ChainSelector from './ChainSelector'
import SecondaryNav from './SecondaryNav'
import PrimaryNav from './PrimaryNav'
import LogoIcon from '../icons/LogoIcon'
import Logo from './Logo'

const Container = styled.div`
  background: ${p => p.theme.colors.darkGradient};
  width: 64px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.3s;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 3;
  &:hover {
    width: 200px;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.2);
  }
  @media (min-width: 800px) {
    position: static;
    width: 200px;
    &:hover {
      box-shadow: none;
    }
  }
`

const LogoLargeContainer = styled.div`
  padding: 3.2rem 3.2rem 5.6rem; // remove this line when reinserting ChainSelector
  height: 125px; // remove this line when reinserting ChainSelector
  // padding: 2.4rem 2.4rem 2.8rem 2.4rem; // add this line when reinserting ChainSelector
  display: none;
  flex-shrink: 0;

  @media (min-width: 800px) {
    display: block;
  }
`

const LogoSmallContainer = styled.div`
  padding: 2.3rem 1.6rem; // remove this line when reinserting ChainSelector
  height: 125px; // remove this line when reinserting ChainSelector
  // padding: 2.3rem 1.6rem 3.2rem; // add this line when reinserting ChainSelector
  display: block;
  flex-shrink: 0;

  @media (min-width: 800px) {
    display: none;
  }
`

// const ChainSelectorContainer = styled.div`
//   margin: 0 0.8rem 2.4rem;

//   @media (min-width: 800px) {
//     margin: 0 1.6rem 2.4rem;
//   }
// `

const PrimaryNavContainer = styled.nav`
  flex-grow: 1;
  margin-top: 5rem; // remove this line when reinserting ChainSelector
`

const SecondaryNavContainer = styled.div`
  padding-bottom: 0;

  @media (min-width: 800px) {
    padding-bottom: 2.4rem;
  }
`

const Footer = styled.div`
  padding: 0rem 1.6rem 2.4rem;
  display: none;

  @media (min-width: 800px) {
    display: block;
  }

  @media (max-height: 650px) {
    display: none;
  }
`

export default class Sidebar extends React.Component {
  render() {
    return (
      <Container>
        <LogoLargeContainer>
          <Logo />
        </LogoLargeContainer>

        <LogoSmallContainer>
          <LogoIcon negative />
        </LogoSmallContainer>

        {/* <ChainSelectorContainer>
          <ChainSelector parent={Container} />
        </ChainSelectorContainer> */}

        <PrimaryNavContainer>
          <PrimaryNav parent={Container} />
        </PrimaryNavContainer>

        <SecondaryNavContainer>
          <SecondaryNav parent={Container} />
        </SecondaryNavContainer>

        <Footer>
          <LogoIcon negative />
        </Footer>
      </Container>
    )
  }
}
