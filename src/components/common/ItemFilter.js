import PropTypes from 'prop-types'
import React from 'react'

export default class ItemFilter extends React.Component {
  static propTypes = {
    defaultFilter: PropTypes.string,
    extractValue: PropTypes.func,
    children: PropTypes.func.isRequired,
    items: PropTypes.array.isRequired
  }

  static defaultProps = {
    defaultFilter: '',
    extractValue: _ => _
  }

  constructor(props) {
    super(props)
    this.state = {
      activeFilter: props.defaultFilter
    }
  }

  filterItems = (filterValue, items) =>
    filterValue
      ? items.filter(item => this.props.extractValue(item) === filterValue)
      : items

  onFilterChange = filterValue => {
    if (typeof filterValue !== 'undefined') {
      this.setState({ activeFilter: filterValue })
    }
  }

  render() {
    const { activeFilter } = this.state

    return this.props.children({
      onFilterChange: this.onFilterChange,
      filteredItems: this.filterItems(
        this.state.activeFilter,
        this.props.items
      ),
      activeFilter
    })
  }
}
