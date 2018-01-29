import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import bip39 from 'bip39';
import React from 'react';

const Container = styled.form`
  padding: 2.4rem;
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
  &:focus {
    outline: none;
  }
`;

const ErrorMsg = styled.p``;

const DoneBtn = styled.button`
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
  max-width: 300px;
  margin-top: 2rem;
  cursor: pointer;
  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
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
      <Container onSubmit={this.onDonePressed}>
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
        <DoneBtn disabled={!weHave12words} type="submit">
          Done
        </DoneBtn>
      </Container>
    );
  }
}

export default withRouter(RecoverFromMnemonic);
