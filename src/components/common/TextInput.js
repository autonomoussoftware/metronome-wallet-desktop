import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Label = styled.label`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: ${p => (p.hasErrors ? p.theme.colors.danger : p.theme.colors.light)};
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
`

const Input = styled.input`
  border: none;
  display: block;
  height: ${({ rows }) => (rows ? 4 * rows + 1.6 + 'rem' : '5.6rem')};
  padding: 0.8rem 1.6rem;
  background-color: rgba(126, 97, 248, 0.2);
  margin-top: 0.8rem;
  width: 100%;
  line-height: 4rem;
  color: ${p => p.theme.colors.light};
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  transition: box-shadow 300ms;
  resize: vertical;
  box-shadow: 0 2px 0 0px
    ${p => (p.hasErrors ? p.theme.colors.danger : 'transparent')};

  &:focus {
    outline: none;
    box-shadow: 0 2px 0 0px ${p => p.theme.colors.primary};
  }
`

const ErrorMsg = styled.div`
  color: ${p => p.theme.colors.danger};
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: right;
  text-shadow: 0 1px 1px ${p => p.theme.colors.darkShade};
  margin-top: 0.4rem;
  width: 100%;
  margin-bottom: -2rem;
`

export default class TextInput extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string,
    autoFocus: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ]),
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    type: PropTypes.string,
    rows: PropTypes.number,
    cols: PropTypes.number,
    id: PropTypes.string.isRequired
  }

  state = { isPristine: true }

  InputControl = this.props.rows || this.props.cols
    ? Input.withComponent('textarea')
    : Input

  componentWillReceiveProps(newProps) {
    if (newProps.value !== this.props.value) {
      this.setState({ isPristine: false })
    }
  }

  render() {
    const { label, value, type, id, error, ...other } = this.props

    const { isPristine } = this.state

    const hasErrors = error && error.length > 0

    return (
      <div>
        <Label isPristine={isPristine} hasErrors={hasErrors} htmlFor={id}>
          {label}
        </Label>
        <this.InputControl
          isPristine={isPristine}
          hasErrors={hasErrors}
          value={value || ''}
          type={type || 'text'}
          id={id}
          {...other}
        />
        {hasErrors && (
          <ErrorMsg>
            {typeof error === 'string' ? error : error.join('. ')}
          </ErrorMsg>
        )}
      </div>
    )
  }
}
