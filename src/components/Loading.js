import withLoadingState from 'metronome-wallet-ui-logic/src/hocs/withLoadingState'
import useLoadingState from 'metronome-wallet-ui-logic/src/hooks/useLoadingState'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'

import { LoadingBar, AltLayout } from './common'
import ChecklistItem from './common/ChecklistItem'

const ChecklistContainer = styled.div`
  margin: 4rem auto 2rem;
`

const DetailItem = styled.div`
  opacity: ${p => (p.isActive ? 0.5 : 0.3)};
  font-size: 12px;
  margin-top: 4px;
`

const OkLabel = styled.span`
  color: ${p => p.theme.colors.success};
  margin-left: 4px;
`

const DetailsBtn = styled.button`
  cursor: pointer;
  font: inherit;
  background: none;
  border: none;
  color: inherit;
  opacity: 0.5;
  text-decoration: underline;
  font-size: 12px;
  margin: 0 auto;
  display: block;
  outline: none;

  &:hover {
    opacity: 1;
  }
`

function Loading(props) {
  const { handleDetailsClick, isDetailVisible, isBtnVisible } = useLoadingState(
    props.chainsStatus
  )

  return (
    <AltLayout title="Gathering Information..." data-testid="loading-scene">
      <LoadingBar />
      <ChecklistContainer>
        {Object.keys(props.chainsStatus).map(chainName => {
          const {
            hasBlockHeight,
            hasCoinBalance,
            hasMetBalance,
            hasCoinRate,
            displayName,
            symbol
          } = props.chainsStatus[chainName]

          const isActive =
            hasBlockHeight && hasCoinBalance && hasMetBalance && hasCoinRate

          return (
            <ChecklistItem
              isActive={isActive}
              text={`${displayName} network`}
              key={chainName}
            >
              {isDetailVisible && !isActive && (
                <>
                  <DetailItem isActive={hasBlockHeight}>
                    Blockchain status {hasBlockHeight && <OkLabel>OK</OkLabel>}
                  </DetailItem>
                  <DetailItem isActive={hasCoinRate}>
                    {symbol} exchange data{' '}
                    {hasCoinRate && <OkLabel>OK</OkLabel>}
                  </DetailItem>
                  <DetailItem isActive={hasCoinBalance}>
                    {symbol} balance {hasCoinBalance && <OkLabel>OK</OkLabel>}
                  </DetailItem>
                  <DetailItem isActive={hasMetBalance}>
                    MET balance {hasMetBalance && <OkLabel>OK</OkLabel>}
                  </DetailItem>
                </>
              )}
            </ChecklistItem>
          )
        })}
      </ChecklistContainer>
      {isBtnVisible && (
        <DetailsBtn type="button" onClick={handleDetailsClick}>
          Show details
        </DetailsBtn>
      )}
    </AltLayout>
  )
}

Loading.propTypes = {
  chainsStatus: PropTypes.objectOf(
    PropTypes.shape({
      hasBlockHeight: PropTypes.bool,
      hasCoinBalance: PropTypes.bool,
      hasMetBalance: PropTypes.bool,
      hasCoinRate: PropTypes.bool,
      displayName: PropTypes.string.isRequired,
      symbol: PropTypes.string.isRequired
    })
  ).isRequired
}

export default withLoadingState(Loading)
