import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

const Container = styled.div`
  display: flex;
  flex-shrink: 0;
`

const Tab = styled.button`
  font: inherit;
  cursor: pointer;
  flex-grow: 1;
  border: none;
  border-bottom: 2px solid;
  border-bottom-color: ${p => p.theme.colors.darkShade};
  transition: 0.5s;
  padding: 2.5rem;
  color: ${p => p.theme.colors.light};
  border-radius: 0;
  opacity: 1;
  background: transparent;
  line-height: 2rem;
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: 1.6px;
  text-align: center;
  &[disabled] {
    background: linear-gradient(
      253deg,
      rgba(66, 53, 119, 0.4),
      rgba(126, 97, 248, 0.1)
    );
    opacity: 0.5;
    border-bottom-color: ${p => p.theme.colors.primary};
  }
  &:focus {
    outline: none;
  }
`

export default class Tabs extends React.Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    active: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
          .isRequired,
        id: PropTypes.string.isRequired
      })
    ).isRequired
  }

  onClick = e => this.props.onClick(e.target.dataset.tab)

  render() {
    const { active, items } = this.props

    return (
      <Container>
        {items.map(({ label, id }) => (
          <Tab
            disabled={active === id}
            data-tab={id}
            onClick={this.onClick}
            key={id}
          >
            {label}
          </Tab>
        ))}
      </Container>
    )
  }
}
