import PropTypes from 'prop-types'
import styled from 'styled-components'

function getMargin({ m, mt, mb, my, ml, mr, mx, theme: { spacing } }) {
  const marginBottom = spacing * (m || mb || my || 0) + 'rem'
  const marginRight = spacing * (m || mr || mx || 0) + 'rem'
  const marginLeft = spacing * (m || ml || mx || 0) + 'rem'
  const marginTop = spacing * (m || mt || my || 0) + 'rem'

  return `${marginTop} ${marginRight} ${marginBottom} ${marginLeft}`
}

function getPadding({ p, pt, pb, py, pl, pr, px, theme: { spacing } }) {
  const paddingBottom = spacing * (p || pb || py || 0) + 'rem'
  const paddingRight = spacing * (p || pr || px || 0) + 'rem'
  const paddingLeft = spacing * (p || pl || px || 0) + 'rem'
  const paddingTop = spacing * (p || pt || py || 0) + 'rem'

  return `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`
}

const Spacing = styled.div`
  display: ${({ display }) => display || 'block'};
  padding: ${getPadding};
  margin: ${getMargin};
`

Spacing.propTypes = {
  display: PropTypes.oneOf(['block', 'inline', 'inline-block', 'flex']),
  mt: PropTypes.number, // margin-top only
  mb: PropTypes.number, // margin-bottom only
  ml: PropTypes.number, // margin-left only
  mr: PropTypes.number, // margin-right only
  mx: PropTypes.number, // margin left & right (horizontal)
  my: PropTypes.number, // margin top & bottom (vertical)
  m: PropTypes.number, // all 4 sides,
  pt: PropTypes.number, // padding-top only
  pb: PropTypes.number, // padding-bottom only
  pl: PropTypes.number, // padding-left only
  pr: PropTypes.number, // padding-right only
  px: PropTypes.number, // padding left & right (horizontal)
  py: PropTypes.number, // padding top & bottom (vertical)
  p: PropTypes.number // all 4 sides
}

export default Spacing
