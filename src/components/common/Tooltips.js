import styled, { createGlobalStyle, keyframes } from 'styled-components'
import ReactHintFactory from 'react-hint'
import React from 'react'
import 'react-hint/css/index.css'

const ReactHint = ReactHintFactory(React)

const GlobalStyles = createGlobalStyle`
  .react-hint {
    &:after { display: none !important; }
  }
`

const trans = keyframes`
  from { transform: translateY(-10px); }
  to { transform: translateY(-5px); }
`

const Container = styled.div`
  animation: 0.5s ${trans};
  animation-fill-mode: forwards;
  background-color: ${p =>
    p.negative
      ? p.theme.colors.primary
      : p.darker
      ? p.theme.colors.darker
      : p.theme.colors.dark};
  max-width: ${p => p.maxWidth || 'auto'};
  font-size: 1.3rem;
  padding: 8px 12px;
  border-radius: 4px;
  box-shadow: 0 0px 3px 0px #323232;
  position: relative;
  color: ${p => p.theme.colors.light};

  &:after {
    content: '';
    width: 0;
    height: 0;
    margin: auto;
    display: block;
    position: absolute;
    top: auto;
    bottom: -5px;
    left: 0;
    right: 0;
    border: 5px solid transparent;
    z-index: 1;
    border-bottom: none;
    border-top-color: ${p =>
      p.negative
        ? p.theme.colors.primary
        : p.darker
        ? p.theme.colors.darker
        : p.theme.colors.dark};
  }
`

const onRenderContent = (target, content) => (
  <Container
    data-testid="tooltip"
    negative={target.dataset.rhNegative}
    maxWidth={target.dataset.rhWidth}
    darker={target.dataset.rhDarker}
  >
    {content}
  </Container>
)

const Tooltips = () => (
  <React.Fragment>
    <ReactHint events delay={100} onRenderContent={onRenderContent} />
    <GlobalStyles />
  </React.Fragment>
)

export default Tooltips
