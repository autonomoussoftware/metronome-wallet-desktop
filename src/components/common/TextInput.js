import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Label = styled.label`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: ${p => (p.hasErrors ? p.theme.colors.danger : p.theme.colors.light)};
  text-shadow: ${p => p.theme.textShadow};
`

const Input = styled.input`
  border: none;
  display: block;
  height: ${({ rows }) => (rows ? `${4 * rows + 0.8}rem` : '4.8rem')};
  padding: 0.8rem 1.6rem;
  background-color: ${p => p.theme.colors.translucentPrimary};
  margin-top: 0.8rem;
  width: 100%;
  line-height: 4rem;
  color: ${p => p.theme.colors.light};
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: ${p => p.theme.textShadow};
  transition: box-shadow 300ms;
  resize: vertical;
  box-shadow: 0 2px 0 0px
    ${p => (p.hasErrors ? p.theme.colors.danger : 'transparent')};

  &:focus {
    outline: none;
    box-shadow: 0 2px 0 0px ${p => p.theme.colors.primary};
    box-shadow: ${p =>
      p.noFocus && p.value.length > 0
        ? 'none'
        : `0 2px 0 0px ${p.theme.colors.primary}`};
  }

  @media (min-height: 600px) {
    height: ${({ rows }) => (rows ? `${4 * rows + 1.6}rem` : '5.6rem')};
  }
`

const ErrorMsg = styled.div`
  color: ${p => p.theme.colors.danger};
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: right;
  text-shadow: ${p => p.theme.textShadow};
  margin-top: 0.4rem;
  width: 100%;
  margin-bottom: -2rem;
`

export default class TextInput extends React.Component {
  static propTypes = {
    'data-testid': PropTypes.string,
    placeholder: PropTypes.string,
    autoFocus: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ]),
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    type: PropTypes.oneOf(['text', 'number', 'password', 'url']),
    rows: PropTypes.number,
    cols: PropTypes.number,
    id: PropTypes.string.isRequired
  }

  InputControl = this.props.rows || this.props.cols
    ? Input.withComponent('textarea')
    : Input

  render() {
    const { label, value, type, id, error, ...other } = this.props

    const hasErrors = error && error.length > 0

    return (
      <div>
        <Label hasErrors={hasErrors} htmlFor={id}>
          {label}
        </Label>
        <this.InputControl
          hasErrors={hasErrors}
          value={value || ''}
          type={type || 'text'}
          id={id}
          {...other}
        />
        {hasErrors && (
          <ErrorMsg data-testid={`${this.props['data-testid']}-error`}>
            {typeof error === 'string' ? error : error.join('. ')}
          </ErrorMsg>
        )}
      </div>
    )
  }
}
