import { Component } from 'react';
import type {
  ReactNode,
} from 'react';

import {
  Filterlist,
  eventTypes,
} from '@vtaits/filterlist';
import type {
  ListState,
  Params,
  ItemsLoader,
} from '@vtaits/filterlist';

import defaultShouldRecount from './defaultShouldRecount';

import type {
  ComponentListActions,
  ComponentParams,
} from './types';

export type State<Item, Additional, Error> = {
  isListInited: boolean;
  listState?: ListState<Item, Additional, Error>;
};

class FilterlistWrapper<Item, Additional, Error, FiltersAndSortData> extends Component<
ComponentParams<Item, Additional, Error, FiltersAndSortData>, State<Item, Additional, Error>
> {
  static defaultProps = {
    parseFiltersAndSort: null,
    filtersAndSortData: null,
    shouldRecount: defaultShouldRecount,
    isRecountAsync: false,
    onChangeLoadParams: null,
  };

  unmounted: boolean;

  filterlist: Filterlist<Item, Additional, Error>;

  listActions: ComponentListActions<Item, Additional>;

  constructor(props: ComponentParams<Item, Additional, Error, FiltersAndSortData>) {
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

  async componentDidUpdate(
    prevProps: ComponentParams<Item, Additional, Error, FiltersAndSortData>,
  ): Promise<void> {
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

  componentWillUnmount(): void {
    this.unmounted = true;

    if (this.filterlist) {
      this.filterlist.emitter.removeAllListeners(eventTypes.changeListState);
      this.filterlist.emitter.removeAllListeners(eventTypes.changeLoadParams);
    }
  }

  onChangeLoadParams = (nextListState: ListState<Item, Additional, Error>): void => {
    const {
      onChangeLoadParams,
    } = this.props;

    if (onChangeLoadParams) {
      onChangeLoadParams(nextListState);
    }
  };

  getFilterlistOptions(): Params<Item, Additional, Error> {
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

  async getFilterlistOptionsAsync(): Promise<Params<Item, Additional, Error>> {
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

  syncListState = (): void => {
    this.setState({
      listState: this.filterlist.getListState(),
    });
  };

  loadItemsProxy: ItemsLoader<Item, Additional, Error> = (listState) => {
    const {
      loadItems,
    } = this.props;

    return loadItems(listState);
  };

  async initFilterlistAsync(): Promise<void> {
    const options: Params<Item, Additional, Error> = await this.getFilterlistOptionsAsync();

    if (this.unmounted) {
      return;
    }

    this.createFilterlist(options);

    await this.setState({
      isListInited: true,
      listState: this.filterlist.getListState(),
    });
  }

  initFilterlist(): void {
    const options: Params<Item, Additional, Error> = this.getFilterlistOptions();

    this.createFilterlist(options);
  }

  createFilterlist(options: Params<Item, Additional, Error>): void {
    const filterlist: Filterlist<Item, Additional, Error> = new Filterlist(options);

    filterlist.emitter.addListener(eventTypes.changeListState, this.syncListState);

    const listActions: ComponentListActions<Item, Additional> = {
      loadMore: () => filterlist.loadMore(),
      setFilterValue: (
        filterName: string,
        value: any,
      ) => filterlist.setFilterValue(
        filterName,
        value,
      ),
      applyFilter: (filterName: string) => filterlist.applyFilter(filterName),
      setAndApplyFilter: (
        filterName: string,
        value: any,
      ) => filterlist.setAndApplyFilter(
        filterName,
        value,
      ),
      resetFilter: (filterName: string) => filterlist.resetFilter(filterName),
      setFiltersValues: (values: Record<string, any>) => filterlist.setFiltersValues(values),
      applyFilters: (filtersNames: string[]) => filterlist.applyFilters(filtersNames),
      setAndApplyFilters: (values: Record<string, any>) => filterlist.setAndApplyFilters(values),
      resetFilters: (filtersNames: string[]) => filterlist.resetFilters(filtersNames),
      resetAllFilters: () => filterlist.resetAllFilters(),
      reload: () => filterlist.reload(),
      setSorting: (param: string, asc?: boolean) => filterlist.setSorting(param, asc),
      resetSorting: () => filterlist.resetSorting(),
      insertItem: (
        itemIndex: number,
        item: Item,
        additional?: Additional,
      ) => filterlist.insertItem(itemIndex, item, additional),
      deleteItem: (
        itemIndex: number,
        additional?: Additional,
      ) => filterlist.deleteItem(itemIndex, additional),
      updateItem: (
        itemIndex: number,
        item: Item,
        additional?: Additional,
      ) => filterlist.updateItem(itemIndex, item, additional),
    };

    filterlist.emitter.addListener(eventTypes.changeLoadParams, this.onChangeLoadParams);

    this.listActions = listActions;

    this.filterlist = filterlist;
  }

  render(): ReactNode {
    const {
      children,
    } = this.props;

    const {
      isListInited,
      listState,
    } = this.state;

    return (children as ComponentParams<Item, Additional, Error, FiltersAndSortData>['children'])({
      isListInited,
      listState,
      listActions: this.listActions,
    });
  }
}

export default FilterlistWrapper;
