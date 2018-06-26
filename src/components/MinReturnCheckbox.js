import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Container = styled.label`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: ${p => p.theme.colors.light};
  text-shadow: ${p => p.theme.textShadow};
  margin-top: 1.6rem;
  display: flex;
`

const Checkbox = styled.input`
  margin: 0 0.8rem 0 0;
  font-size: 1.6rem;
  cursor: pointer;
`

const Label = styled.span`
  cursor: pointer;
  user-select: none;
`

const Icon = styled.span`
  margin: 0.15rem 0 0 1rem;
  display: inline-block;
  opacity: 0.7;
`

const ErrorMsg = styled.div`
  color: ${p => p.theme.colors.danger};
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-shadow: ${p => p.theme.textShadow};
  margin-top: 0.2rem;
  width: 100%;
  margin-left: 23px;
`

export default class MinReturnCheckbox extends React.Component {
  static propTypes = {
    useMinimum: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    error: PropTypes.string
  }

  render() {
    const hasErrors = this.props.error && this.props.error.length > 0

    return (
      <div>
        <Container>
          <Checkbox
            data-testid="useMinimum-cb"
            onChange={this.props.onToggle}
            checked={this.props.useMinimum}
            type="checkbox"
            id="useMinimum"
          />
          <Label>{this.props.label}</Label>
          <Icon
            data-rh-darker
            data-rh-width="400px"
            data-rh="This option will cancel the conversion if there is a change in price after you submit the transaction and the expected conversion amount is not met.  Gas will be consumed regardless."
          >
            <svg width="14px" height="14px" viewBox="0 0 14 14">
              <path
                stroke="none"
                fill="white"
                d="M6.33333333,10.3333333 L7.66666667,10.3333333 L7.66666667,6.33333333 L6.33333333,6.33333333 L6.33333333,10.3333333 L6.33333333,10.3333333 Z M7,0.333333333 C3.32,0.333333333 0.333333333,3.32 0.333333333,7 C0.333333333,10.68 3.32,13.6666667 7,13.6666667 C10.68,13.6666667 13.6666667,10.68 13.6666667,7 C13.6666667,3.32 10.68,0.333333333 7,0.333333333 L7,0.333333333 Z M7,12.3333333 C4.06,12.3333333 1.66666667,9.94 1.66666667,7 C1.66666667,4.06 4.06,1.66666667 7,1.66666667 C9.94,1.66666667 12.3333333,4.06 12.3333333,7 C12.3333333,9.94 9.94,12.3333333 7,12.3333333 L7,12.3333333 Z M6.33333333,5 L7.66666667,5 L7.66666667,3.66666667 L6.33333333,3.66666667 L6.33333333,5 L6.33333333,5 Z"
              />
            </svg>
          </Icon>
        </Container>
        {hasErrors && (
          <ErrorMsg data-testid={`${this.props['data-testid']}-error`}>
            {typeof this.props.error === 'string'
              ? this.props.error
              : this.props.error.join('. ')}
          </ErrorMsg>
        )}
      </div>
    )
  }
}
