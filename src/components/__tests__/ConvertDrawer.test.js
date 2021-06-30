import * as testUtils from '../../testUtils'
import ConvertDrawer from '../converter/ConvertDrawer'
import { Simulate } from 'react-testing-library'
import React from 'react'

const closeHandler = jest.fn()

const getElement = (defaultTab) => (
  <ConvertDrawer onRequestClose={closeHandler} defaultTab={defaultTab} isOpen />
)

describe.skip('<ConvertDrawer/>', () => {
  it('displays MET TO ETH form when clicking the tab', () => {
    const { queryByTestId, getByTestId } = testUtils.reduxRender(
      getElement(),
      testUtils.getInitialState()
    )
    expect(queryByTestId('metToEth-form')).toBeNull()
    Simulate.click(testUtils.withDataset(getByTestId('metToEth-tab'), 'tab'))
    expect(queryByTestId('metToEth-form')).not.toBeNull()
  })

  it('displays ETH TO MET form when clicking the tab', () => {
    const { queryByTestId, getByTestId } = testUtils.reduxRender(
      getElement('metToEth'),
      testUtils.getInitialState()
    )
    expect(queryByTestId('ethToMet-form')).toBeNull()
    Simulate.click(testUtils.withDataset(getByTestId('ethToMet-tab'), 'tab'))
    expect(queryByTestId('ethToMet-form')).not.toBeNull()
  })
})
