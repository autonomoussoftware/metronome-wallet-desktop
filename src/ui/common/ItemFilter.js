import PropTypes from 'prop-types';
import React from 'react';

export default class ItemFilter extends React.Component {
  static propTypes = {
    defaultFilter: PropTypes.string,
    extractValue: PropTypes.func,
    children: PropTypes.func.isRequired,
    items: PropTypes.array.isRequired
  };

  static defaultProps = {
    defaultFilter: '',
    extractValue: _ => _
  };

  constructor(props) {
    super(props);
    this.state = {
      filteredItems: this.filterItems(props.defaultFilter),
      activeFilter: props.defaultFilter
    };
  }

  filterItems = filterValue => {
    return filterValue
      ? this.props.items.filter(
          item => this.props.extractValue(item) === filterValue
        )
      : this.props.items;
  };

  onFilterChange = filterValue => {
    const filteredItems = this.filterItems(filterValue);
    this.setState({ filteredItems, activeFilter: filterValue });
  };

  render() {
    const { filteredItems, activeFilter } = this.state;

    return this.props.children({
      onFilterChange: this.onFilterChange,
      filteredItems,
      activeFilter
    });
  }
}
