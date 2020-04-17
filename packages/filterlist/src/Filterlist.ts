import EventEmitter from 'eventemitter3';
import arrayInsert from 'array-insert';

import collectListInitialState from './collectListInitialState';
import collectOptions from './collectOptions';

import * as eventTypes from './eventTypes';
import { LoadListError } from './errors';

import type {
  Sort,
  ListState,
  Options,
  Params,
  ItemsLoaderResponse,
  ItemsLoader,
  EventType,
} from './types';

class Filterlist<Item = any, Additional = any, Error = any> {
  requestId: number;

  listState: ListState<Item, Additional, Error>;

  options: Options;

  itemsLoader: ItemsLoader<Item, Additional, Error>;

  emitter: EventEmitter;

  constructor(params: Params<Item, Additional, Error>) {
    this.emitter = new EventEmitter();

    const {
      loadItems,
    } = params;

    if (!loadItems) {
      throw new Error('loadItems is required');
    }

    if (typeof loadItems !== 'function') {
      throw new Error('loadItems should be a function');
    }

    this.itemsLoader = loadItems;

    this.requestId = 0;
    this.listState = collectListInitialState(params);
    this.options = collectOptions(params);

    this.onInit();
  }

  getListStateBeforeChange(): ListState<Item, Additional, Error> {
    const prevListState = this.listState;

    const {
      saveItemsWhileLoad,
      alwaysResetFilters,
    } = this.options;

    return {
      ...prevListState,

      filters: {
        ...prevListState.filters,
        ...alwaysResetFilters,
      },

      appliedFilters: {
        ...prevListState.appliedFilters,
        ...alwaysResetFilters,
      },

      loading: true,
      error: null,

      items: saveItemsWhileLoad ? prevListState.items : [],

      shouldClean: true,
    };
  }

  emitEvent(eventType: EventType): void {
    this.emitter.emit(eventType, this.listState);
  }

  onInit(): void {
    const {
      autoload,
    } = this.options;

    if (autoload) {
      this.loadItemsOnInit();
    }
  }

  async loadItemsOnInit(): Promise<void> {
    const prevListState = this.listState;

    this.setListState({
      ...prevListState,

      loading: true,
      error: null,
      shouldClean: false,
    });

    this.emitEvent(eventTypes.loadMore);

    await this.requestItems();
  }

  async loadMore(): Promise<void> {
    const prevListState = this.listState;

    this.setListState({
      ...prevListState,

      loading: true,
      error: null,
      shouldClean: false,
    });

    this.emitEvent(eventTypes.loadMore);
    this.emitEvent(eventTypes.changeLoadParams);

    await this.requestItems();
  }

  setFilterValue(filterName: string, value: any): void {
    const prevListState = this.listState;

    this.setListState({
      ...prevListState,

      filters: {
        ...prevListState.filters,

        [filterName]: value,
      },
    });

    this.emitEvent(eventTypes.setFilterValue);
  }

  async applyFilter(filterName: string): Promise<void> {
    const prevListState = this.listState;
    const stateBeforeChange = this.getListStateBeforeChange();

    this.setListState({
      ...stateBeforeChange,

      appliedFilters: {
        ...stateBeforeChange.appliedFilters,
        [filterName]: prevListState.filters[filterName],
      },
    });

    this.emitEvent(eventTypes.applyFilter);
    this.emitEvent(eventTypes.changeLoadParams);

    await this.requestItems();
  }

  async setAndApplyFilter(filterName: string, value: any): Promise<void> {
    const prevListState = this.listState;
    const stateBeforeChange = this.getListStateBeforeChange();

    this.setListState({
      ...stateBeforeChange,

      filters: {
        ...prevListState.filters,

        [filterName]: value,
      },

      appliedFilters: {
        ...stateBeforeChange.appliedFilters,
        [filterName]: value,
      },
    });

    this.emitEvent(eventTypes.setAndApplyFilter);
    this.emitEvent(eventTypes.changeLoadParams);

    await this.requestItems();
  }

  async resetFilter(filterName: string): Promise<void> {
    const prevListState = this.listState;
    const stateBeforeChange = this.getListStateBeforeChange();

    const initialValue = this.options.resetFiltersTo[filterName];

    this.setListState({
      ...stateBeforeChange,

      filters: {
        ...prevListState.filters,

        [filterName]: initialValue,
      },

      appliedFilters: {
        ...stateBeforeChange.appliedFilters,
        [filterName]: initialValue,
      },
    });

    this.emitEvent(eventTypes.resetFilter);
    this.emitEvent(eventTypes.changeLoadParams);

    await this.requestItems();
  }

  setFiltersValues(values: Record<string, any>): void {
    const prevListState = this.listState;

    this.setListState({
      ...prevListState,

      filters: {
        ...prevListState.filters,
        ...values,
      },
    });

    this.emitEvent(eventTypes.setFiltersValues);
  }

  async applyFilters(filtersNames: string[]): Promise<void> {
    const prevListState = this.listState;
    const stateBeforeChange = this.getListStateBeforeChange();

    const newAppliedFilters = filtersNames
      .reduce((res, filterName) => {
        res[filterName] = prevListState.filters[filterName];

        return res;
      }, {});

    this.setListState({
      ...stateBeforeChange,

      appliedFilters: {
        ...stateBeforeChange.appliedFilters,
        ...newAppliedFilters,
      },
    });

    this.emitEvent(eventTypes.applyFilters);
    this.emitEvent(eventTypes.changeLoadParams);

    await this.requestItems();
  }

  async setAndApplyFilters(values: Record<string, any>): Promise<void> {
    const prevListState = this.listState;
    const stateBeforeChange = this.getListStateBeforeChange();

    this.setListState({
      ...stateBeforeChange,

      filters: {
        ...prevListState.filters,
        ...values,
      },

      appliedFilters: {
        ...stateBeforeChange.appliedFilters,
        ...values,
      },
    });

    this.emitEvent(eventTypes.setAndApplyFilters);
    this.emitEvent(eventTypes.changeLoadParams);

    await this.requestItems();
  }

  async resetFilters(filtersNames: string[]): Promise<void> {
    const prevListState = this.listState;
    const stateBeforeChange = this.getListStateBeforeChange();

    const {
      resetFiltersTo,
    } = this.options;

    const filtersForReset = filtersNames
      .reduce((res, filterName) => {
        res[filterName] = resetFiltersTo[filterName];

        return res;
      }, {});

    this.setListState({
      ...stateBeforeChange,

      filters: {
        ...prevListState.filters,
        ...filtersForReset,
      },

      appliedFilters: {
        ...stateBeforeChange.appliedFilters,
        ...filtersForReset,
      },
    });

    this.emitEvent(eventTypes.resetFilters);
    this.emitEvent(eventTypes.changeLoadParams);

    await this.requestItems();
  }

  async resetAllFilters(): Promise<void> {
    const prevListState = this.listState;
    const stateBeforeChange = this.getListStateBeforeChange();

    const {
      resetFiltersTo,
      saveFiltersOnResetAll,
      alwaysResetFilters,
    } = this.options;

    const savedFilters = saveFiltersOnResetAll
      .reduce((res, filterName) => {
        res[filterName] = prevListState.filters[filterName];

        return res;
      }, {});

    const savedAppliedFilters = saveFiltersOnResetAll
      .reduce((res, filterName) => {
        res[filterName] = prevListState.appliedFilters[filterName];

        return res;
      }, {});

    this.setListState({
      ...stateBeforeChange,

      filters: {
        ...alwaysResetFilters,
        ...resetFiltersTo,
        ...savedFilters,
      },

      appliedFilters: {
        ...alwaysResetFilters,
        ...resetFiltersTo,
        ...savedAppliedFilters,
      },
    });

    this.emitEvent(eventTypes.resetAllFilters);
    this.emitEvent(eventTypes.changeLoadParams);

    await this.requestItems();
  }

  getNextAsc(param: string, asc?: boolean): boolean {
    if (typeof asc === 'boolean') {
      return asc;
    }

    const prevListState = this.listState;

    if (prevListState.sort.param === param) {
      return !prevListState.sort.asc;
    }

    return this.options.isDefaultSortAsc;
  }

  async setSorting(param: string, asc?: boolean): Promise<void> {
    const stateBeforeChange = this.getListStateBeforeChange();

    const nextAsc = this.getNextAsc(param, asc);

    this.setListState({
      ...stateBeforeChange,

      sort: {
        param,
        asc: nextAsc,
      },
    });

    this.emitEvent(eventTypes.setSorting);
    this.emitEvent(eventTypes.changeLoadParams);

    await this.requestItems();
  }

  async resetSorting(): Promise<void> {
    const stateBeforeChange = this.getListStateBeforeChange();

    const {
      isDefaultSortAsc,
    } = this.options;

    this.setListState({
      ...stateBeforeChange,

      sort: {
        param: null,
        asc: isDefaultSortAsc,
      },
    });

    this.emitEvent(eventTypes.resetSorting);
    this.emitEvent(eventTypes.changeLoadParams);

    await this.requestItems();
  }

  async setFiltersAndSorting({
    filters,
    appliedFilters,
    sort,
  }: {
    filters: Record<string, any>;
    appliedFilters: Record<string, any>;
    sort: Sort;
  }): Promise<void> {
    const stateBeforeChange = this.getListStateBeforeChange();

    this.setListState({
      ...stateBeforeChange,

      filters: filters || stateBeforeChange.filters,
      appliedFilters: appliedFilters || stateBeforeChange.appliedFilters,
      sort: sort || stateBeforeChange.sort,
    });

    this.emitEvent(eventTypes.setFiltersAndSorting);

    await this.requestItems();
  }

  async requestItems(): Promise<void> {
    const nextRequestId = this.requestId + 1;
    ++this.requestId;

    this.emitEvent(eventTypes.requestItems);

    let response;
    let error;
    try {
      response = await this.itemsLoader(this.listState);
    } catch (e) {
      error = e;
    }

    if (this.requestId !== nextRequestId) {
      return;
    }

    if (error) {
      if (error instanceof LoadListError) {
        this.onError(error);
        return;
      }

      throw error;
    }

    this.onSuccess(response);
  }

  onSuccess(response: ItemsLoaderResponse<Item, Additional>): void {
    const prevListState = this.listState;

    const {
      saveItemsWhileLoad,
    } = this.options;

    this.setListState({
      ...prevListState,

      loading: false,
      shouldClean: false,
      isFirstLoad: false,

      items: (saveItemsWhileLoad && prevListState.shouldClean)
        ? response.items
        : [...prevListState.items, ...response.items],

      additional: (typeof response.additional !== 'undefined')
        ? response.additional
        : prevListState.additional,
    });

    this.emitEvent(eventTypes.loadItemsSuccess);
  }

  onError(error: LoadListError<Error, Additional>): void {
    const prevListState = this.listState;

    this.setListState({
      ...prevListState,

      loading: false,
      shouldClean: false,

      error: (typeof error.error !== 'undefined')
        ? error.error
        : null,

      additional: (typeof error.additional !== 'undefined')
        ? error.additional
        : prevListState.additional,
    });

    this.emitEvent(eventTypes.loadItemsError);
  }

  insertItem(itemIndex: number, item: Item, additional?: Additional): void {
    const prevListState = this.listState;

    this.setListState({
      ...prevListState,

      items: arrayInsert(prevListState.items, itemIndex, item),

      additional: typeof additional !== 'undefined'
        ? additional
        : prevListState.additional,
    });

    this.emitEvent(eventTypes.insertItem);
  }

  deleteItem(itemIndex: number, additional?: Additional): void {
    const prevListState = this.listState;

    this.setListState({
      ...prevListState,

      items: prevListState.items
        .filter((item, index) => index !== itemIndex),

      additional: typeof additional !== 'undefined'
        ? additional
        : prevListState.additional,
    });

    this.emitEvent(eventTypes.deleteItem);
  }

  updateItem(itemIndex: number, item: Item, additional?: Additional): void {
    const prevListState = this.listState;

    this.setListState({
      ...prevListState,

      items: prevListState.items
        .map((stateItem, index) => {
          if (index === itemIndex) {
            return item;
          }

          return stateItem;
        }),

      additional: typeof additional !== 'undefined'
        ? additional
        : prevListState.additional,
    });

    this.emitEvent(eventTypes.updateItem);
  }

  setListState(nextListState: ListState<Item, Additional, Error>): void {
    this.listState = nextListState;

    this.emitEvent(eventTypes.changeListState);
  }

  getListState(): ListState<Item, Additional, Error> {
    return this.listState;
  }
}

export default Filterlist;
