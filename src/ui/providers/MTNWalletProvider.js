import EthereumTx from 'ethereumjs-tx';
import PropTypes from 'prop-types';
import ethutils from 'ethereumjs-util';
import hdkey from 'ethereumjs-wallet/hdkey';
import React from 'react';
import Web3 from 'web3';

export default class MTNWalletProvider extends React.Component {
  static propTypes = {
    getTransactions: PropTypes.func.isRequired,
    auctionAddress: PropTypes.string.isRequired,
    getBalance: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
    nodeUrl: PropTypes.string.isRequired,
    index: PropTypes.number,
    seed: PropTypes.string.isRequired
  };

  static defaultProps = {
    index: 0 // use first address by default
  };

  constructor(props) {
    super(props);
    this.api = new Web3(new Web3.providers.WebsocketProvider(props.nodeUrl));
    this.state = {
      lastTransactions: null,
      balance: null,
      ...this.getAddress(props.index)
    };
  }

  componentWillMount() {
    const { getTransactions, getBalance } = this.props;
    const { address } = this.state;

    getBalance(address)
      .then(({ data }) =>
        this.setState({ balance: Web3.utils.fromWei(data.balance) })
      )
      .catch(() => this.setState({ balance: '0' }));

    getTransactions(address)
      .then(({ data }) =>
        this.setState({
          lastTransactions: data.events
            .map(({ metaData }) => metaData)
            .sort((a, b) => b.timestamp - a.timestamp)
        })
      )
      .catch(e => this.setState({ error: e.message }));
  }

  getAddress(index) {
    const wallet = hdkey
      .fromMasterSeed(ethutils.toBuffer(ethutils.addHexPrefix(this.props.seed)))
      .derivePath(`m/44'/60'/0'/0/${index}`)
      .getWallet();

    return {
      address: wallet.getChecksumAddressString(),
      privKey: wallet.getPrivateKey(),
      pubKey: wallet.getPublicKey()
    };
  }

  sendTransaction = ({ to, value }) => {
    return Promise.all([
      this.api.eth.getGasPrice(),
      this.api.eth.net.getId(),
      this.api.eth.getTransactionCount(this.state.address),
      this.api.eth.estimateGas({ to, value })
    ]).then(res => {
      const txParams = {
        gasPrice: Web3.utils.toHex(res[0]),
        chainId: res[1],
        nonce: res[2],
        value: Web3.utils.toHex(value),
        from: this.state.address,
        gas: res[3],
        to
      };
      const tx = new EthereumTx(txParams);
      tx.sign(this.state.privKey);

      return this.api.eth.sendSignedTransaction(
        '0x' + tx.serialize().toString('hex')
      );
    });
  };

  buyMTN = value => {
    return this.sendTransaction({ value, to: this.props.auctionAddress });
  };

  render() {
    const { lastTransactions, balance, address, privKey, pubKey } = this.state;

    return this.props.children({
      lastTransactions,
      sendTransaction: this.sendTransaction,
      balance,
      address,
      privKey,
      pubKey,
      onBuy: this.buyMTN
    });
  }
}
