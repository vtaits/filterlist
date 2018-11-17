import { EventEmitter } from 'fbemitter';

import collectListInitialState from './collectListInitialState';
import collectOptions from './collectOptions';

import * as eventTypes from './eventTypes';
import { LoadListError } from './errors';

class Filterlist extends EventEmitter {
  constructor(params) {
    super();

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

  getListStateBeforeChange() {
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

  emitEvent(eventType) {
    this.emit(eventType, this.listState);
  }

  onInit() {
    const {
      autoload,
    } = this.options;

    if (autoload) {
      this.loadItems();
    }
  }

  async loadItems() {
    const prevListState = this.listState;

    this.listState = {
      ...prevListState,

      loading: true,
      error: null,
      shouldClean: false,
    };

    this.emitEvent(eventTypes.loadItems);

    await this.requestItems();
  }

  setFilterValue(filterName, value) {
    const prevListState = this.listState;

    this.listState = {
      ...prevListState,

      filters: {
        ...prevListState.filters,

        [filterName]: value,
      },
    };

    this.emitEvent(eventTypes.setFilterValue);
  }

  async applyFilter(filterName) {
    const prevListState = this.listState;
    const stateBeforeChange = this.getListStateBeforeChange();

    this.listState = {
      ...stateBeforeChange,

      appliedFilters: {
        ...stateBeforeChange.appliedFilters,
        [filterName]: prevListState.filters[filterName],
      },
    };

    this.emitEvent(eventTypes.applyFilter);

    await this.requestItems();
  }

  async setAndApplyFilter(filterName, value) {
    const prevListState = this.listState;
    const stateBeforeChange = this.getListStateBeforeChange();

    this.listState = {
      ...stateBeforeChange,

      filters: {
        ...prevListState.filters,

        [filterName]: value,
      },

      appliedFilters: {
        ...stateBeforeChange.appliedFilters,
        [filterName]: value,
      },
    };

    this.emitEvent(eventTypes.setAndApplyFilter);

    await this.requestItems();
  }

  async resetFilter(filterName) {
    const prevListState = this.listState;
    const stateBeforeChange = this.getListStateBeforeChange();

    const initialValue = this.options.initialFilters[filterName];

    this.listState = {
      ...stateBeforeChange,

      filters: {
        ...prevListState.filters,

        [filterName]: initialValue,
      },

      appliedFilters: {
        ...stateBeforeChange.appliedFilters,
        [filterName]: initialValue,
      },
    };

    this.emitEvent(eventTypes.resetFilter);

    await this.requestItems();
  }

  setFiltersValues(values) {
    const prevListState = this.listState;

    this.listState = {
      ...prevListState,

      filters: {
        ...prevListState.filters,
        ...values,
      },
    };

    this.emitEvent(eventTypes.setFiltersValues);
  }

  async applyFilters(filtersNames) {
    const prevListState = this.listState;
    const stateBeforeChange = this.getListStateBeforeChange();

    const newAppliedFilters = filtersNames
      .reduce((res, filterName) => {
        res[filterName] = prevListState.filters[filterName];

        return res;
      }, {});

    this.listState = {
      ...stateBeforeChange,

      appliedFilters: {
        ...stateBeforeChange.appliedFilters,
        ...newAppliedFilters,
      },
    };

    this.emitEvent(eventTypes.applyFilters);

    await this.requestItems();
  }

  async setAndApplyFilters(values) {
    const prevListState = this.listState;
    const stateBeforeChange = this.getListStateBeforeChange();

    this.listState = {
      ...stateBeforeChange,

      filters: {
        ...prevListState.filters,
        ...values,
      },

      appliedFilters: {
        ...stateBeforeChange.appliedFilters,
        ...values,
      },
    };

    this.emitEvent(eventTypes.setAndApplyFilters);

    await this.requestItems();
  }

  async resetFilters(filtersNames) {
    const prevListState = this.listState;
    const stateBeforeChange = this.getListStateBeforeChange();

    const {
      initialFilters,
    } = this.options;

    const filtersForReset = filtersNames
      .reduce((res, filterName) => {
        res[filterName] = initialFilters[filterName];

        return res;
      }, {});

    this.listState = {
      ...stateBeforeChange,

      filters: {
        ...prevListState.filters,
        ...filtersForReset,
      },

      appliedFilters: {
        ...stateBeforeChange.appliedFilters,
        ...filtersForReset,
      },
    };

    this.emitEvent(eventTypes.resetFilters);

    await this.requestItems();
  }

  async resetAllFilters() {
    const prevListState = this.listState;
    const stateBeforeChange = this.getListStateBeforeChange();

    const {
      initialFilters,
      saveFiltersOnResetAll,
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

    this.listState = {
      ...stateBeforeChange,

      filters: {
        ...prevListState.filters,
        ...initialFilters,
        ...savedFilters,
      },

      appliedFilters: {
        ...stateBeforeChange.appliedFilters,
        ...initialFilters,
        ...savedAppliedFilters,
      },
    };

    this.emitEvent(eventTypes.resetAllFilters);

    await this.requestItems();
  }

  getNextAsc(param, asc) {
    if (typeof asc === 'boolean') {
      return asc;
    }

    const prevListState = this.listState;

    if (prevListState.sort.param === param) {
      return !prevListState.sort.asc;
    }

    return this.options.isDefaultSortAsc;
  }

  async setSorting(param, asc) {
    const stateBeforeChange = this.getListStateBeforeChange();

    const nextAsc = this.getNextAsc(param, asc);

    this.listState = {
      ...stateBeforeChange,

      sort: {
        param,
        asc: nextAsc,
      },
    };

    this.emitEvent(eventTypes.setSorting);

    await this.requestItems();
  }

  async resetSorting() {
    const stateBeforeChange = this.getListStateBeforeChange();

    const {
      isDefaultSortAsc,
    } = this.options;

    this.listState = {
      ...stateBeforeChange,

      sort: {
        param: null,
        asc: isDefaultSortAsc,
      },
    };

    this.emitEvent(eventTypes.resetSorting);

    await this.requestItems();
  }

  async setFiltersAndSorting({
    filters,
    appliedFilters,
    sort,
  }) {
    const stateBeforeChange = this.getListStateBeforeChange();

    this.listState = {
      ...stateBeforeChange,

      filters: filters || stateBeforeChange.filters,
      appliedFilters: appliedFilters || stateBeforeChange.appliedFilters,
      sort: sort || stateBeforeChange.sort,
    };

    this.emitEvent(eventTypes.setFiltersAndSorting);

    await this.requestItems();
  }

  async requestItems() {
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

  onSuccess(response) {
    const prevListState = this.listState;

    const {
      saveItemsWhileLoad,
    } = this.options;

    this.listState = {
      ...prevListState,

      loading: false,
      shouldClean: false,

      items: (saveItemsWhileLoad && prevListState.shouldClean)
        ? response.items
        : prevListState.items.concat(response.items),

      additional: (typeof response.additional !== 'undefined')
        ? response.additional
        : prevListState.additional,
    };

    this.emitEvent(eventTypes.loadItemsSuccess);
  }

  onError(error) {
    const prevListState = this.listState;

    this.listState = {
      ...prevListState,

      loading: false,
      shouldClean: false,

      error: (typeof error.error !== 'undefined')
        ? error.error
        : null,

      additional: (typeof error.additional !== 'undefined')
        ? error.additional
        : prevListState.additional,
    };

    this.emitEvent(eventTypes.loadItemsError);
  }

  getListState() {
    return this.listState;
  }
}

export default Filterlist;
