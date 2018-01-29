import MTNWalletProvider from '../providers/MTNWalletProvider';
import PropTypes from 'prop-types';
import settings from '../../config/settings';
import React from 'react';
import axios from 'axios';

const getTransactions = addr =>
  axios.get(`${settings.MTN_API_URL}/event/account/${addr}`);

const getBalance = addr => axios.get(`${settings.MTN_API_URL}/account/${addr}`);

const MTNWallet = ({ children, seed }) => (
  <MTNWalletProvider
    getTransactions={getTransactions}
    auctionAddress={settings.MTN_AUCTION_ADDR}
    getBalance={getBalance}
    nodeUrl={settings.MTN_PUBLIC_NODE_URL}
    seed={seed}
  >
    {children}
  </MTNWalletProvider>
);

MTNWallet.propTypes = {
  children: PropTypes.func.isRequired,
  seed: PropTypes.string.isRequired
};

export default MTNWallet;
