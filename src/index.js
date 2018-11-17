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
