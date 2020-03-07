import { Component } from 'react';
import PropTypes from 'prop-types';

import Filterlist, { eventTypes } from '@vtaits/filterlist';

import defaultShouldRecount from './defaultShouldRecount';

export const methodsForChild = [
  'loadItems',
  'setFilterValue',
  'applyFilter',
  'setAndApplyFilter',
  'resetFilter',
  'setFiltersValues',
  'applyFilters',
  'setAndApplyFilters',
  'resetFilters',
  'resetAllFilters',
  'setSorting',
  'resetSorting',
  'insertItem',
  'deleteItem',
  'updateItem',
];

class FilterlistWrapper extends Component {
  constructor(props) {
    super(props);

    const {
      parseFiltersAndSort,
      isRecountAsync,
    } = props;

    const shouldInitAsync = Boolean(parseFiltersAndSort) && isRecountAsync;

    if (shouldInitAsync) {
      this.initFilterlistAsync();
    } else {
      this.initFilterlist();
    }

    this.state = {
      isListInited: !shouldInitAsync,
      listState: shouldInitAsync
        ? null
        : this.filterlist.getListState(),
    };
  }

  async componentDidUpdate(prevProps) {
    const {
      parseFiltersAndSort,
      filtersAndSortData,
      shouldRecount,
    } = this.props;

    if (
      parseFiltersAndSort
      && shouldRecount(filtersAndSortData, prevProps.filtersAndSortData)
    ) {
      const parsedFiltersAndSort = await parseFiltersAndSort(filtersAndSortData);

      this.filterlist.setFiltersAndSorting(parsedFiltersAndSort);
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.filterlist.removeAllListeners(eventTypes.changeListState);
    this.filterlist.removeAllListeners(eventTypes.changeLoadParams);
  }

  onChangeLoadParams = (nextListState) => {
    const {
      onChangeLoadParams,
    } = this.props;

    if (onChangeLoadParams) {
      onChangeLoadParams(nextListState);
    }
  }

  getFilterlistOptions() {
    const {
      parseFiltersAndSort,
      filtersAndSortData,
    } = this.props;

    if (parseFiltersAndSort) {
      const parsedFiltersAndSort = parseFiltersAndSort(filtersAndSortData);

      return {
        ...this.props,
        ...parsedFiltersAndSort,
        loadItems: this.loadItemsProxy,
      };
    }

    return {
      ...this.props,
      loadItems: this.loadItemsProxy,
    };
  }

  async getFilterlistOptionsAsync() {
    const {
      parseFiltersAndSort,
      filtersAndSortData,
    } = this.props;

    const parsedFiltersAndSort = await parseFiltersAndSort(filtersAndSortData);

    return {
      ...this.props,
      ...parsedFiltersAndSort,
      loadItems: this.loadItemsProxy,
    };
  }

  syncListState = () => {
    this.setState({
      listState: this.filterlist.getListState(),
    });
  }

  loadItemsProxy = (listState) => {
    const {
      loadItems,
    } = this.props;

    return loadItems(listState);
  }

  async initFilterlistAsync() {
    const options = await this.getFilterlistOptionsAsync();

    if (this.unmounted) {
      return;
    }

    this.createFilterlist(options);

    await this.setState({
      isListInited: true,
      listState: this.filterlist.getListState(),
    });
  }

  initFilterlist() {
    const options = this.getFilterlistOptions();

    this.createFilterlist(options);
  }

  createFilterlist(options) {
    const filterlist = new Filterlist(options);

    filterlist.addListener(eventTypes.changeListState, this.syncListState);

    const listActions = methodsForChild.reduce((res, methodName) => {
      res[methodName] = filterlist[methodName].bind(filterlist);
      return res;
    }, {});

    filterlist.addListener(eventTypes.changeLoadParams, this.onChangeLoadParams);

    this.listActions = listActions;

    this.filterlist = filterlist;
  }

  render() {
    const {
      children,
    } = this.props;

    const {
      isListInited,
      listState,
    } = this.state;

    return children({
      isListInited,
      listState,
      listActions: this.listActions,
    });
  }
}

FilterlistWrapper.propTypes = {
  loadItems: PropTypes.func.isRequired,
  parseFiltersAndSort: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  filtersAndSortData: PropTypes.any,
  shouldRecount: PropTypes.func,
  isRecountAsync: PropTypes.bool,

  children: PropTypes.func.isRequired,

  onChangeLoadParams: PropTypes.func,
};

FilterlistWrapper.defaultProps = {
  parseFiltersAndSort: null,
  filtersAndSortData: null,
  shouldRecount: defaultShouldRecount,
  isRecountAsync: false,
  onChangeLoadParams: null,
};

export default FilterlistWrapper;
