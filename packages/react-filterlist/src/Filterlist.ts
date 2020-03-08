import { Component } from 'react';
import PropTypes from 'prop-types';

import Filterlist, {
  eventTypes,
  ListState,
} from '@vtaits/filterlist';

import defaultShouldRecount from './defaultShouldRecount';

import {
  ComponentListActions,
  ComponentParams,
} from './types';

type State<Item = any, Additional = any, Error = any> = {
  isListInited: boolean;
  listState?: ListState<Item, Additional, Error>;
};

class FilterlistWrapper<
  Item = any,
  Additional = any,
  Error = any,
  FiltersAndSortData = any
> extends Component<
  ComponentParams<Item, Additional, Error, FiltersAndSortData>, State<Item, Additional, Error>
> {
  static propTypes = {
    loadItems: PropTypes.func.isRequired,
    parseFiltersAndSort: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    filtersAndSortData: PropTypes.any,
    shouldRecount: PropTypes.func,
    isRecountAsync: PropTypes.bool,

    children: PropTypes.func.isRequired,

    onChangeLoadParams: PropTypes.func,
  };

  static defaultProps = {
    parseFiltersAndSort: null,
    filtersAndSortData: null,
    shouldRecount: defaultShouldRecount,
    isRecountAsync: false,
    onChangeLoadParams: null,
  };

  unmounted: boolean;

  filterlist?: Filterlist<Item, Additional, Error>;

  listActions: ComponentListActions<Item, Additional>;

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
    this.filterlist.emitter.removeAllListeners(eventTypes.changeListState);
    this.filterlist.emitter.removeAllListeners(eventTypes.changeLoadParams);
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

    filterlist.emitter.addListener(eventTypes.changeListState, this.syncListState);

    const listActions: ComponentListActions<Item, Additional> = {
      loadItems: () => filterlist.loadItems(),
      setFilterValue: (filterName: string, value: any) => filterlist.setFilterValue(filterName, value),
      applyFilter: (filterName: string) => filterlist.applyFilter(filterName),
      setAndApplyFilter: (filterName: string, value: any) => filterlist.setAndApplyFilter(filterName, value),
      resetFilter: (filterName: string) => filterlist.resetFilter(filterName),
      setFiltersValues: (values: Object) => filterlist.setFiltersValues(values),
      applyFilters: (filtersNames: string[]) => filterlist.applyFilters(filtersNames),
      setAndApplyFilters: (values: Object) => filterlist.setAndApplyFilters(values),
      resetFilters: (filtersNames: string[]) => filterlist.resetFilters(filtersNames),
      resetAllFilters: () => filterlist.resetAllFilters(),
      setSorting: (param: string, asc?: boolean) => filterlist.setSorting(param, asc),
      resetSorting: () => filterlist.resetSorting(),
      insertItem: (itemIndex: number, item: Item, additional?: Additional) => filterlist.insertItem(itemIndex, item, additional),
      deleteItem: (itemIndex: number, additional?: Additional) => filterlist.deleteItem(itemIndex, additional),
      updateItem: (itemIndex: number, item: Item, additional?: Additional) => filterlist.updateItem(itemIndex, item, additional),
    };
    
    filterlist.emitter.addListener(eventTypes.changeLoadParams, this.onChangeLoadParams);

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

export default FilterlistWrapper;
