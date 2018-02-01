import { DarkLayout, Btn } from '../common';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import bip39 from 'bip39';
import React from 'react';

const Form = styled.form`
  padding: 2.4rem 4.8rem;
`;

const Msg = styled.p``;

const InputContainer = styled.div``;

const Input = styled.textarea`
  display: block;
  border: none;
  width: 100%;
  padding: 1rem;
  border-radius: 4px;
  font-size: 2.4rem;
  resize: vertical;
  &:focus {
    outline: none;
  }
`;

const ErrorMsg = styled.p``;

const DoneBtn = Btn.extend`
  min-width: 15rem;
  margin-top: 2rem;
`;

class RecoverFromMnemonic extends React.Component {
  static propTypes = {
    onMnemonic: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired
  };

  state = {
    input: null,
    error: null
  };

  onDonePressed = e => {
    e.preventDefault();
    const { input } = this.state;
    if (bip39.validateMnemonic(input)) {
      this.props.onMnemonic(input);
      this.props.history.push('/wallets');
    } else {
      this.setState({
        error: "These words don't look like a valid recovery phrase."
      });
    }
  };

  onInputChanged = e => {
    this.setState({ input: e.target.value, error: null });
  };

  render() {
    const { input, error } = this.state;

    const weHave12words =
      input &&
      input
        .trim()
        .split(' ')
        .map(w => w.trim())
        .filter(w => w.length > 0).length === 12;

    return (
      <DarkLayout title="Recover wallet">
        <Form onSubmit={this.onDonePressed}>
          <Msg>Enter the 12 words to recover your wallet.</Msg>
          <p>This action will replace your current stored seed!</p>
          <InputContainer>
            <Input
              autofocus
              onChange={this.onInputChanged}
              value={input || ''}
              rows="3"
            />
          </InputContainer>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <DoneBtn disabled={!weHave12words} submit>
            Done
          </DoneBtn>
        </Form>
      </DarkLayout>
    );
  }
}

export default withRouter(RecoverFromMnemonic);
