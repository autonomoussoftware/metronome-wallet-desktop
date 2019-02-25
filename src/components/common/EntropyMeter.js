import stringEntropy from 'fast-password-entropy'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

/**
 * Returns an interpolated CSS hue value between red & green
 * based on passwordEntropy / targetEntropy ratio
 *
 *   ratio === 0 -> red
 *   ratio  <  1 -> orange
 *   ratio >=  1 -> green
 *
 *   @param {number} ratio passwordEntropy / targetEntropy ratio
 *   @returns {number} interpolated CSS hue value between red & green
 */
function getHue(ratio) {
  // Hues are adapted to match the theme's success and danger colors
  const orangeHue = 50
  const greenHue = 139
  const redHue = 11

  return ratio < 1 ? ratio * orangeHue + redHue : greenHue
}

const Container = styled.div`
  margin-top: 2px;
`

const Bar = styled.div`
  height: 2px;
  margin-top: -2px;

  &:before {
    margin-bottom: 2px;
    content: '';
    display: block;
    background-color: ${({ ratio }) => `hsl(${getHue(ratio)}, 62%, 55%)`};
    width: ${({ ratio }) => `${Math.min(ratio * 100, 100)}%`};
    height: 2px;
    transition: 0.5s;
    box-shadow: ${({ ratio }) =>
      ratio >= 1 ? `0 0 10px hsla(${getHue(ratio)}, 100%, 50%, 1)` : 'none'};
  }
`

const Message = styled.div`
  line-height: 1.6rem;
  height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: ${p =>
    p.ratio >= 1
      ? p.theme.colors.success
      : p.ratio >= 0.75
      ? 'hsla(40, 100%, 50%, 0.75)'
      : p.theme.colors.danger};
  text-shadow: ${p => p.theme.textShadow};
  text-align: right;
  margin-bottom: -18px;
`

export default class EntropyMeter extends React.Component {
  static propTypes = {
    targetEntropy: PropTypes.number.isRequired,
    password: PropTypes.string
  }

  getEntropy(string) {
    return string ? stringEntropy(string) : 0
  }

  getMessage(ratio) {
    if (ratio > 0 && ratio < 0.75) return 'Too weak'
    if (ratio >= 0.75 && ratio < 1) return 'Almost there...'
    if (ratio >= 1 && ratio < 1.5) return 'Strong'
    if (ratio >= 1.5) return 'Very strong'
    return ''
  }

  render() {
    const { targetEntropy, password } = this.props
    const passwordEntropy = this.getEntropy(password)
    const ratio = passwordEntropy / targetEntropy
    const message = this.getMessage(ratio)

    return (
      <Container>
        <Bar ratio={ratio} />
        <Message ratio={ratio}>{message}</Message>
      </Container>
    )
  }
}
