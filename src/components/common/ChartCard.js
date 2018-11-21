import { VictoryGroup, VictoryLine } from 'victory'
import React, { Component } from 'react'
import LoadingBar from './LoadingBar'
import { Btn } from './Btn'
import styled from 'styled-components'
import Sp from './Spacing'

const Container = styled.div`
  padding: 32px 16px 24px;
  min-height: 232px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Label = styled.div`
  margin-top: 1.6rem;
  text-align: center;
  font-size: 13px;
  font-weight: 200;
`

const LoadingContainer = styled.div`
  text-align: center;
  font-size: 13px;
  font-weight: 200;
  width: 100%;
  max-width: 300px;
`

const ChartContainer = styled.div`
  width: 100%;
`

const FailureContainer = styled.div`
  text-align: center;
`

export default class ChartCard extends Component {
  // eslint-disable-next-line complexity
  render() {
    return (
      <Container>
        {this.props.chartStatus === 'pending' && (
          <LoadingContainer>
            <LoadingBar />

            <Sp mt={2}>Loading data...</Sp>
          </LoadingContainer>
        )}
        {this.props.chartStatus === 'success' && (
          <ChartContainer>
            <VictoryGroup
              domainPadding={{ x: [0, 0], y: [4, 4] }}
              padding={{ top: 0, bottom: 0, right: 0, left: 0 }}
              height={100}
              {...this.props.extraChartProps}
            >
              <VictoryLine
                animate={{ duration: 2000, onLoad: { duration: 1000 } }}
                style={{ data: { stroke: '#7e61f8', strokeWidth: 2 } }}
                data={this.props.chartData}
              />
            </VictoryGroup>
            <Label>{this.props.chartLabel}</Label>
          </ChartContainer>
        )}
        {this.props.chartStatus === 'failure' && (
          <FailureContainer>
            <Btn onClick={this.props.onRetry}>Retry</Btn>
            <Label>Converter data cannot be retrieved</Label>
          </FailureContainer>
        )}
      </Container>
    )
  }
}
