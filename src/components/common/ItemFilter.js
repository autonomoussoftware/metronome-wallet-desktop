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
      filteredItems: this.filterItems(props.defaultFilter, props.items),
      activeFilter: props.defaultFilter
    }
  }

  filterItems = (filterValue, items) =>
    filterValue
      ? items.filter(item => this.props.extractValue(item) === filterValue)
      : items

  onFilterChange = filterValue => {
    if (typeof filterValue !== 'undefined') {
      const filteredItems = this.filterItems(filterValue, this.props.items)
      this.setState({ filteredItems, activeFilter: filterValue })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.items.length === this.props.items.length) return
    const filteredItems = this.filterItems(
      this.state.activeFilter,
      this.props.items
    )
    this.setState({ filteredItems })
  }

  render() {
    const { filteredItems, activeFilter } = this.state

    return this.props.children({
      onFilterChange: this.onFilterChange,
      filteredItems,
      activeFilter
    })
  }
}
