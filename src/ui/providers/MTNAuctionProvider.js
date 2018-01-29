import PropTypes from 'prop-types';
import React from 'react';
import io from 'socket.io-client';

export default class MTNAuctionProvider extends React.Component {
  static propTypes = {
    statusTopic: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired,
    apiUrl: PropTypes.string.isRequired
  };

  state = {
    status: null
  };

  componentDidMount() {
    const { statusTopic, apiUrl } = this.props;

    this.socket = io(apiUrl);
    this.socket.on(statusTopic, status => this.setState({ status }));
  }

  componentWillUnmount() {
    if (this.socket) {
      this.socket.off();
      this.socket.close();
    }
  }

  render() {
    const { status } = this.state;

    return this.props.children({ status });
  }
}
