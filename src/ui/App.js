import { retrieveSeed, storeSeed } from './seedStorage';
import React, { Component } from 'react';
import MnemonicGenerator from './components/MnemonicGenerator';
import Router from './Router';
import bip39 from 'bip39';

class App extends Component {
  state = {
    isReady: false,
    seed: null
  };

  componentDidMount() {
    this.setState({ isReady: true, seed: retrieveSeed() });
  }

  onMnemonic = mnemonic => {
    this.setState({ isReady: false }, () => {
      const seed = bip39.mnemonicToSeedHex(mnemonic);
      this.setState({ seed, isReady: true }, () => storeSeed(seed));
    });
  };

  render() {
    const { isReady, seed } = this.state;

    return isReady ? (
      seed ? (
        <Router seed={seed} onMnemonic={this.onMnemonic} />
      ) : (
        <MnemonicGenerator onMnemonic={this.onMnemonic} />
      )
    ) : (
      <p>Loading...</p>
    );
  }
}

export default App;
