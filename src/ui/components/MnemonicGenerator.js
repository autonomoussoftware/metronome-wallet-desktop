import PropTypes from 'prop-types';
import styled from 'styled-components';
import React from 'react';
import bip39 from 'bip39';

const Container = styled.div``;

const Msg = styled.p`
  font-size: 2rem;
  margin: 0 auto;
  max-width: 640px;
  opacity: 0.75;
  padding: 3rem;
`;

const Mnemonic = styled.div`
  max-width: 810px;
  margin: 0 auto;
  text-align: center;
  padding: 2rem;
`;

const Word = styled.span`
  font-size: 3rem;
  margin: 0 3rem;
  display: inline-block;
  line-height: 2em;
`;

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
  margin: 2rem auto;
  cursor: pointer;
`;

export default class MnemonicGenerator extends React.Component {
  static propTypes = {
    onMnemonic: PropTypes.func.isRequired
  };

  state = { mnemonic: bip39.generateMnemonic() };

  onDonePressed = () => this.props.onMnemonic(this.state.mnemonic);

  render() {
    const { mnemonic } = this.state;

    return (
      <Container>
        <Msg>
          Write down these words and keep them safe. They will allow you to
          recover your funds in case you loose this device or uninstall the app.
        </Msg>
        <Mnemonic>
          {mnemonic.split(' ').map((word, i) => <Word key={i}>{word}</Word>)}
        </Mnemonic>
        <DoneBtn onClick={this.onDonePressed}>Done</DoneBtn>
      </Container>
    );
  }
}
