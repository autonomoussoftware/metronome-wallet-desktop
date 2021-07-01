import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { Label, Flex } from '../common'

const Field = styled(Flex.Row)`
  background-color: ${({ theme }) => theme.colors.lightShade};
  padding: 2rem 1.6rem;
  margin-top: 0.8rem;
  min-height: 5.6rem;
`

const Value = styled.div`
  color: ${({ theme }) => theme.colors.light};
  font-size: 1.3rem;
  letter-spacing: 0.5px;
  font-weight: 600;
`

const Suffix = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.3rem;
  letter-spacing: 0.5px;
  font-weight: 600;
`

export default class ReadOnlyField extends React.Component {
  static propTypes = {
    suffix: PropTypes.node,
    label: PropTypes.string.isRequired,
    value: PropTypes.node.isRequired,
    id: PropTypes.string.isRequired
  }

  render() {
    return (
      <div>
        <Label htmlFor={this.props.id}>{this.props.label}</Label>
        <Field justify="space-between">
          <Value>{this.props.value}</Value>
          {this.props.suffix && <Suffix>{this.props.suffix}</Suffix>}
        </Field>
      </div>
    )
  }
}
