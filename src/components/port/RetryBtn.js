import styled from 'styled-components'

import { Btn } from '../common'

const RetryBtn = styled(Btn)`
  margin-left: 2.4rem;
  background-color: rgba(126, 97, 248, 0.4);
  background-image: none;
  color: ${({ theme }) => theme.colors.light};
  font-size: 1.3rem;
  letter-spacing: 0.4px;
  min-width: 108px;
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
  box-shadow: none;

  &:hover,
  &:focus {
    opacity: 0.8;
  }
`

export default RetryBtn
