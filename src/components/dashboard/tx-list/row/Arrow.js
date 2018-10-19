import styled from 'styled-components'
import React from 'react'

const Container = styled.span`
  color: ${p => p.theme.colors.primary};
  position: relative;
  top: -0.4em;
  margin: 0 0.5em;
  transform: scale3d(1.5, 2, 1);
  display: inline-block;
`

const Arrow = () => <Container>&rarr;</Container>

export default Arrow
