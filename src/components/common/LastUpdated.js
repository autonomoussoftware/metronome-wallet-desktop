import PropTypes from 'prop-types'
import TimeAgo from 'metronome-wallet-ui-logic/src/components/TimeAgo'
import styled from 'styled-components'
import React from 'react'

export const Label = styled.div`
  transition: color 0.5s;
  font-size: 1.3rem;
  color: ${({ theme, level }) =>
    ({
      warning: theme.colors.warning,
      danger: theme.colors.danger,
      ok: theme.colors.weak
    }[level])};
`

/**
 * A default info string
 *
 * @param {Object} params - Render function params
 * @param {string} params.level - Either "ok", "warning" or "danger"
 * @param {string} params.timeAgo - "[amount] [unit] ago" string
 */
function defaultRender({ level, timeAgo }) {
  return <Label level={level}>Last updated {timeAgo}</Label>
}

defaultRender.propTypes = {
  timeAgo: PropTypes.string,
  level: PropTypes.oneOf(['ok', 'warning', 'danger']).isRequired
}

/**
 * Renders a "last updated" info text which auto-updates and changes color
 *
 * @param {Object} props - Component props
 * @param {number} props.timestamp - Last updated timestamp
 * @param {Function} props.render - An optional render function
 */
export default function LastUpdated({ timestamp, render }) {
  return (
    <TimeAgo
      updateInterval={1000}
      timestamp={timestamp}
      render={typeof render === 'function' ? render : defaultRender}
    />
  )
}

LastUpdated.propTypes = {
  timestamp: PropTypes.number,
  render: PropTypes.func
}
