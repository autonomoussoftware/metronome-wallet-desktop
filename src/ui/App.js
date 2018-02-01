import { retrieveSeed, storeSeed } from './seedStorage';
import bip39 from 'bip39';
import React, { Component } from 'react';

import Router from './Router';
import MnemonicGenerator from './components/MnemonicGenerator';

import wallet from '../services/wallet'

class App extends Component {
  state = {
    isReady: false,
    seed: null
  };

  componentDidMount() {
    const seed = retrieveSeed()
    wallet.init(seed)

    this.setState({ isReady: true, seed });
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
