import PurchaseFormProvider from '../providers/PurchaseFormProvider';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Drawer from './Drawer';
import React from 'react';
import Web3 from 'web3';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.header`
  background-color: ${p => p.theme.colors.primary};
  padding: 1.7rem 2.4rem;
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  font-size: 2.4rem;
  line-height: 3rem;
  font-weight: bold;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin: 0;
`;

const Form = styled.form``;

const FieldsContainer = styled.div`
  padding: 3.2rem 2.4rem;
`;

const Field = styled.div``;

const Label = styled.label`
  line-height: 1.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
`;

const Input = styled.input`
  border: none;
  display: block;
  height: 5.6rem;
  padding: 0.8rem 1.6rem;
  background-color: rgba(126, 97, 248, 0.2);
  margin-top: 0.8rem;
  width: 100%;
  line-height: 4rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
`;

const ErrorMsg = styled.p`
  color: red;
`;

const BtnContainer = styled.div`
  background-image: linear-gradient(to bottom, #272727, #323232);
  height: 100%;
  padding: 6.4rem 2.4rem;
  flex-grow: 1;
`;

const SubmitBtn = styled.button`
  font: inherit;
  display: block;
  border: none;
  padding: 0;
  width: 100%;
  height: 56px;
  border-radius: 1.2rem;
  background-image: linear-gradient(to top, #ededed, #ffffff);
  box-shadow: inset 0 3px 0 0 rgba(255, 255, 255, 0.1);
  line-height: 2.5rem;
  color: ${p => p.theme.colors.primary};
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export default class BuyMTNDrawer extends React.Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    currentPrice: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onBuy: PropTypes.func.isRequired
  };

  static initialState = {
    disclaimerAccepted: true,
    receipt: null,
    status: 'init',
    error: null,
    input: null
  };

  state = BuyMTNDrawer.initialState;

  componentWillReceiveProps(newProps) {
    if (newProps.isOpen !== this.props.isOpen) {
      this.setState(BuyMTNDrawer.initialState);
    }
  }

  onInputChanged = e => this.setState({ input: e.target.value });

  onSubmit = e => {
    e.preventDefault();
    this.setState({ status: 'pending' }, () =>
      this.props
        .onBuy(Web3.utils.toWei(this.state.input.replace(',', '.')))
        .then(receipt => this.setState({ status: 'success', receipt }))
        .catch(e => this.setState({ status: 'failure', error: e.message }))
    );
  };

  render() {
    const { disclaimerAccepted, receipt, status, error, input } = this.state;
    const { onRequestClose, isOpen, currentPrice } = this.props;

    return (
      <Drawer onRequestClose={onRequestClose} isOpen={isOpen}>
        <Container>
          <Header>
            <Title>Buy Metronome</Title>
          </Header>
          <PurchaseFormProvider
            disclaimerAccepted={disclaimerAccepted}
            currentPrice={currentPrice}
            amount={input}
          >
            {({
              expectedMTNamount,
              isValidPurchase,
              isValidAmount,
              isPristine
            }) => (
              <Form onSubmit={this.onSubmit}>
                <FieldsContainer>
                  <Field>
                    <Label>ETH amount</Label>
                    <Input
                      placeholder="Enter a valid amount"
                      onChange={this.onInputChanged}
                      disabled={status !== 'init'}
                      value={input === null ? '' : input}
                    />
                  </Field>
                  {expectedMTNamount && (
                    <div>
                      <p>You would get</p>
                      <p>{expectedMTNamount} MTN</p>
                    </div>
                  )}
                  {!isValidAmount &&
                    !isPristine && <ErrorMsg>Invalid ETH amount</ErrorMsg>}
                  {status === 'success' && (
                    <div>
                      <p>Your receipt:</p>
                      <pre>{JSON.stringify(receipt, null, 2)}</pre>
                    </div>
                  )}
                  {status === 'pending' && (
                    <div>
                      <p>Waiting for receipt...</p>
                    </div>
                  )}
                  {status === 'failure' && <ErrorMsg>{error}</ErrorMsg>}
                </FieldsContainer>
                {status === 'init' && (
                  <BtnContainer>
                    <SubmitBtn disabled={!isValidPurchase} type="submit">
                      Buy
                    </SubmitBtn>
                  </BtnContainer>
                )}
              </Form>
            )}
          </PurchaseFormProvider>
        </Container>
      </Drawer>
    );
  }
}
