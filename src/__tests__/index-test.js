/* eslint-disable no-new */

import Filterlist from '../index';

import collectListInitialState from '../collectListInitialState';
import collectOptions from '../collectOptions';
import * as eventTypes from '../eventTypes';
import { LoadListError } from '../errors';

const defaultParams = {
  loadItems: Function.prototype,
};

let callsSequence = [];

const loadItemsMethod = jest.fn(() => {
  callsSequence.push('loadItems');
});
const onInitMethod = jest.fn(() => {
  callsSequence.push('onInit');
});
const requestItemsMethod = jest.fn(() => {
  callsSequence.push('requestItems');
});
const onSuccessMethod = jest.fn(() => {
  callsSequence.push('onSuccess');
});
const onErrorMethod = jest.fn(() => {
  callsSequence.push('onError');
});

/* eslint-disable class-methods-use-this */
class ManualFilterlist extends Filterlist {
  loadItems(...args) {
    return loadItemsMethod(...args);
  }

  manualLoadItems(...args) {
    return super.loadItems(...args);
  }

  onInit(...args) {
    return onInitMethod(...args);
  }

  manualOnInit(...args) {
    return super.onInit(...args);
  }

  requestItems(...args) {
    return requestItemsMethod(...args);
  }

  manualRequestItems(...args) {
    return super.requestItems(...args);
  }

  onSuccess(...args) {
    return onSuccessMethod(...args);
  }

  manualOnSuccess(...args) {
    return super.onSuccess(...args);
  }

  onError(...args) {
    return onErrorMethod(...args);
  }

  manualOnError(...args) {
    return super.onError(...args);
  }
}
/* eslint-enable class-methods-use-this */

afterEach(() => {
  callsSequence = [];

  loadItemsMethod.mockClear();
  onInitMethod.mockClear();
  requestItemsMethod.mockClear();
  onSuccessMethod.mockClear();
  onErrorMethod.mockClear();
});

test('should throw an exception if loadItems is not defined', () => {
  expect(() => {
    new ManualFilterlist({});
  })
    .toThrowError('loadItems is required');
});

test('should throw an exception if loadItems is not a function', () => {
  expect(() => {
    new ManualFilterlist({
      loadItems: 123,
    });
  })
    .toThrowError('loadItems should be a function');
});

test('should collect listState on init', () => {
  const params = {
    ...defaultParams,

    sort: {
      param: 'param',
      asc: false,
    },

    appliedFilters: {
      filter1: 'value1',
      filter2: 'value2',
      filter3: ['value3', 'value4'],
    },

    additional: {
      count: 0,
    },
  };

  const filterlist = new ManualFilterlist(params);

  expect(filterlist.getListState())
    .toEqual(collectListInitialState(params));
});

test('should collect options on init', () => {
  const params = {
    ...defaultParams,

    alwaysResetFilters: {
      filter1: 'value1',
      filter2: 'value2',
    },
    saveFiltersOnResetAll: ['filter1', 'filter2'],
    saveItemsWhileLoad: true,
    autoload: false,
    isDefaultSortAsc: true,
  };

  const filterlist = new ManualFilterlist(params);

  expect(filterlist.options)
    .toEqual(collectOptions(params));
});

test('should set initial requestId', () => {
  const filterlist = new ManualFilterlist({
    ...defaultParams,
  });

  expect(filterlist.requestId).toBe(0);
});

test('should set loadItems', () => {
  const loadItems = jest.fn();

  const filterlist = new ManualFilterlist({
    ...defaultParams,
    loadItems,
  });

  expect(filterlist.itemsLoader).toBe(loadItems);
});

test('should call onInit on init', () => {
  new ManualFilterlist({
    ...defaultParams,
  });

  expect(onInitMethod.mock.calls.length).toBe(1);
});

test('should call loadItems on init', () => {
  const filterlist = new ManualFilterlist({
    ...defaultParams,
  });

  filterlist.manualOnInit();

  expect(loadItemsMethod.mock.calls.length).toBe(1);
});

test('should not call loadItems on init if autoload is false', () => {
  const filterlist = new ManualFilterlist({
    ...defaultParams,
    autoload: false,
  });

  filterlist.manualOnInit();

  expect(loadItemsMethod.mock.calls.length).toBe(0);
});

test('should dispatch event and request items on load items', async () => {
  const filterlist = new ManualFilterlist({
    ...defaultParams,
  });

  const onLoadItems = jest.fn(() => {
    callsSequence.push('onLoadItems');
  });

  const prevState = filterlist.getListState();

  filterlist.listState = {
    ...prevState,
    loading: false,
    shouldClean: true,
    error: 'error',
  };

  filterlist.addListener(eventTypes.loadItems, onLoadItems);

  await filterlist.manualLoadItems();

  expect(onLoadItems.mock.calls.length).toBe(1);
  expect(onLoadItems.mock.calls[0][0]).toEqual({
    ...prevState,
    loading: true,
    shouldClean: false,
    error: null,
  });

  expect(requestItemsMethod.mock.calls.length).toBe(1);

  expect(callsSequence).toEqual(['onInit', 'onLoadItems', 'requestItems']);
});

test('should request items successfully', async () => {
  const testResponse = {
    items: [1, 2, 3],

    additional: {
      count: 3,
    },
  };

  const loadItems = jest.fn(() => {
    callsSequence.push('itemsLoader');

    return testResponse;
  });

  const filterlist = new ManualFilterlist({
    ...defaultParams,

    loadItems,
  });

  const onRequestItems = jest.fn(() => {
    callsSequence.push('onRequestItems');
  });

  const prevState = filterlist.getListState();

  filterlist.addListener(eventTypes.requestItems, onRequestItems);
  filterlist.requestId = 3;

  await filterlist.manualRequestItems();

  expect(onRequestItems.mock.calls.length).toBe(1);
  expect(onRequestItems.mock.calls[0][0]).toBe(prevState);

  expect(onSuccessMethod.mock.calls.length).toBe(1);
  expect(onSuccessMethod.mock.calls[0][0]).toBe(testResponse);

  expect(filterlist.requestId).toBe(4);

  expect(callsSequence).toEqual([
    'onInit', 'onRequestItems', 'itemsLoader', 'onSuccess',
  ]);
});

test('should request items with error', async () => {
  const testError = {
    error: 'error',

    additional: {
      count: 3,
    },
  };

  const loadItems = jest.fn(() => {
    callsSequence.push('itemsLoader');

    throw new LoadListError(testError);
  });

  const filterlist = new ManualFilterlist({
    ...defaultParams,

    loadItems,
  });

  const onRequestItems = jest.fn(() => {
    callsSequence.push('onRequestItems');
  });

  const prevState = filterlist.getListState();

  filterlist.addListener(eventTypes.requestItems, onRequestItems);
  filterlist.requestId = 3;

  await filterlist.manualRequestItems();

  expect(onRequestItems.mock.calls.length).toBe(1);
  expect(onRequestItems.mock.calls[0][0]).toBe(prevState);

  expect(onErrorMethod.mock.calls.length).toBe(1);
  expect(onErrorMethod.mock.calls[0][0]).toEqual(testError);

  expect(filterlist.requestId).toBe(4);

  expect(callsSequence).toEqual([
    'onInit', 'onRequestItems', 'itemsLoader', 'onError',
  ]);
});

test('should throw up not LoadListError', async () => {
  const loadItems = jest.fn(() => {
    callsSequence.push('itemsLoader');

    throw new Error('Other error');
  });

  const filterlist = new ManualFilterlist({
    ...defaultParams,

    loadItems,
  });

  const onRequestItems = jest.fn(() => {
    callsSequence.push('onRequestItems');
  });

  const prevState = filterlist.getListState();

  filterlist.addListener(eventTypes.requestItems, onRequestItems);
  filterlist.requestId = 3;

  let hasError = false;

  try {
    await filterlist.manualRequestItems();
  } catch (e) {
    hasError = true;
  }

  expect(hasError).toBe(true);

  expect(onRequestItems.mock.calls.length).toBe(1);
  expect(onRequestItems.mock.calls[0][0]).toBe(prevState);

  expect(onSuccessMethod.mock.calls.length).toBe(0);
  expect(onErrorMethod.mock.calls.length).toBe(0);

  expect(filterlist.requestId).toBe(4);

  expect(callsSequence).toEqual([
    'onInit', 'onRequestItems', 'itemsLoader',
  ]);
});

test('should ingore success response if requestId increased in process of loadItems', async () => {
  const testResponse = {
    items: [1, 2, 3],

    additional: {
      count: 3,
    },
  };

  let filterlist;

  const loadItems = jest.fn(() => {
    filterlist.requestId = 10;
    callsSequence.push('itemsLoader');

    return testResponse;
  });

  filterlist = new ManualFilterlist({
    ...defaultParams,

    loadItems,
  });

  const onRequestItems = jest.fn(() => {
    callsSequence.push('onRequestItems');
  });

  const prevState = filterlist.getListState();

  filterlist.addListener(eventTypes.requestItems, onRequestItems);
  filterlist.requestId = 3;

  await filterlist.manualRequestItems();

  expect(onRequestItems.mock.calls.length).toBe(1);
  expect(onRequestItems.mock.calls[0][0]).toBe(prevState);

  expect(onSuccessMethod.mock.calls.length).toBe(0);
  expect(onErrorMethod.mock.calls.length).toBe(0);

  expect(filterlist.requestId).toBe(10);

  expect(callsSequence).toEqual([
    'onInit', 'onRequestItems', 'itemsLoader',
  ]);
});

test('should ingore LoadListError if requestId increased in process of loadItems', async () => {
  const testError = {
    error: 'error',

    additional: {
      count: 3,
    },
  };

  let filterlist;

  const loadItems = jest.fn(() => {
    filterlist.requestId = 10;
    callsSequence.push('itemsLoader');

    throw new LoadListError(testError);
  });

  filterlist = new ManualFilterlist({
    ...defaultParams,

    loadItems,
  });

  const onRequestItems = jest.fn(() => {
    callsSequence.push('onRequestItems');
  });

  const prevState = filterlist.getListState();

  filterlist.addListener(eventTypes.requestItems, onRequestItems);
  filterlist.requestId = 3;

  await filterlist.manualRequestItems();

  expect(onRequestItems.mock.calls.length).toBe(1);
  expect(onRequestItems.mock.calls[0][0]).toBe(prevState);

  expect(onSuccessMethod.mock.calls.length).toBe(0);
  expect(onErrorMethod.mock.calls.length).toBe(0);

  expect(filterlist.requestId).toBe(10);

  expect(callsSequence).toEqual([
    'onInit', 'onRequestItems', 'itemsLoader',
  ]);
});

describe('onSuccess', () => {
  test('should append items', () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,
    });

    const prevState = filterlist.getListState();

    filterlist.listState = {
      ...prevState,
      loading: true,
      items: [1, 2, 3],
    };

    filterlist.manualOnSuccess({
      items: [4, 5, 6],
    });

    expect(filterlist.listState.loading).toBe(false);
    expect(filterlist.listState.items)
      .toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('should replace items', () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,

      saveItemsWhileLoad: true,
    });

    const prevState = filterlist.getListState();

    filterlist.listState = {
      ...prevState,
      loading: true,
      shouldClean: true,
      items: [1, 2, 3],
    };

    filterlist.manualOnSuccess({
      items: [4, 5, 6],
    });

    expect(filterlist.listState.loading).toBe(false);
    expect(filterlist.listState.shouldClean).toBe(false);
    expect(filterlist.listState.items)
      .toEqual([4, 5, 6]);
  });

  test('should update additional', () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,
    });

    const prevState = filterlist.getListState();

    filterlist.listState = {
      ...prevState,
      loading: true,
      additional: {
        test: 'value1',
      },
    };

    filterlist.manualOnSuccess({
      items: [],
      additional: {
        test: 'value2',
      },
    });

    expect(filterlist.listState.loading).toBe(false);
    expect(filterlist.listState.additional).toEqual({
      test: 'value2',
    });
  });

  test('should update additional with falsy value', () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,
    });

    const prevState = filterlist.getListState();

    filterlist.listState = {
      ...prevState,
      loading: true,
      additional: {
        test: 'value1',
      },
    };

    filterlist.manualOnSuccess({
      items: [],
      additional: null,
    });

    expect(filterlist.listState.loading).toBe(false);
    expect(filterlist.listState.additional).toBe(null);
  });

  test('should not update additional', () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,
    });

    const prevState = filterlist.getListState();

    filterlist.listState = {
      ...prevState,
      loading: true,
      additional: {
        test: 'value1',
      },
    };

    filterlist.manualOnSuccess({
      items: [],
    });

    expect(filterlist.listState.loading).toBe(false);
    expect(filterlist.listState.additional).toEqual({
      test: 'value1',
    });
  });
});

describe('onError', () => {
  test('should set error and additional', () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,
    });

    const prevState = filterlist.getListState();

    filterlist.listState = {
      ...prevState,
      loading: true,
      shouldClean: true,
      error: 'error1',
      additional: 'additional1',
    };

    filterlist.manualOnError({
      error: 'error2',
      additional: 'additional2',
    });

    expect(filterlist.listState.loading).toBe(false);
    expect(filterlist.listState.shouldClean).toBe(false);
    expect(filterlist.listState.error).toBe('error2');
    expect(filterlist.listState.additional).toBe('additional2');
  });

  test('should set only error', () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,
    });

    const prevState = filterlist.getListState();

    filterlist.listState = {
      ...prevState,
      loading: true,
      shouldClean: true,
      error: 'error1',
      additional: 'additional1',
    };

    filterlist.manualOnError({
      error: 'error2',
    });

    expect(filterlist.listState.loading).toBe(false);
    expect(filterlist.listState.shouldClean).toBe(false);
    expect(filterlist.listState.error).toBe('error2');
    expect(filterlist.listState.additional).toBe('additional1');
  });

  test('should set only additional and null as error', () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,
    });

    const prevState = filterlist.getListState();

    filterlist.listState = {
      ...prevState,
      loading: true,
      shouldClean: true,
      error: 'error1',
      additional: 'additional1',
    };

    filterlist.manualOnError({
      additional: 'additional2',
    });

    expect(filterlist.listState.loading).toBe(false);
    expect(filterlist.listState.shouldClean).toBe(false);
    expect(filterlist.listState.error).toBe(null);
    expect(filterlist.listState.additional).toBe('additional2');
  });
});

describe('getListStateBeforeChange', () => {
  test('should reset previous items', () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,

      alwaysResetFilters: {
        test2: 'value2_3',
      },
    });

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      filters: {
        test1: 'value1_1',
        test2: 'value2_1',
      },

      appliedFilters: {
        test1: 'value1_2',
        test2: 'value2_2',
      },

      items: [1, 2, 3],

      error: 'error',

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    const expectedState = {
      ...nextState,

      filters: {
        ...nextState.filters,
        test2: 'value2_3',
      },

      appliedFilters: {
        ...nextState.appliedFilters,
        test2: 'value2_3',
      },

      items: [],
      error: null,
      loading: true,
      shouldClean: true,
    };

    expect(filterlist.getListStateBeforeChange()).toEqual(expectedState);
  });

  test('should save previous items', () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,

      saveItemsWhileLoad: true,

      alwaysResetFilters: {
        test2: 'value2_3',
      },
    });

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      filters: {
        test1: 'value1_1',
        test2: 'value2_1',
      },

      appliedFilters: {
        test1: 'value1_2',
        test2: 'value2_2',
      },

      items: [1, 2, 3],

      error: 'error',

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    const expectedState = {
      ...nextState,

      filters: {
        ...nextState.filters,
        test2: 'value2_3',
      },

      appliedFilters: {
        ...nextState.appliedFilters,
        test2: 'value2_3',
      },

      items: [1, 2, 3],
      error: null,
      loading: true,
      shouldClean: true,
    };

    expect(filterlist.getListStateBeforeChange()).toEqual(expectedState);
  });
});

describe('public methods', () => {
  test('should set filter value', () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,
    });

    const onSetFilterValue = jest.fn();

    filterlist.addListener(eventTypes.setFilterValue, onSetFilterValue);

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      filters: {
        test1: 'value1',
        test2: 'value2',
      },

      items: [1, 2, 3],

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    filterlist.setFilterValue('test2', 'value3');

    const expectedListState = {
      ...nextState,

      filters: {
        ...nextState.filters,
        test2: 'value3',
      },
    };

    expect(filterlist.listState).toEqual(expectedListState);

    expect(onSetFilterValue.mock.calls.length).toBe(1);
    expect(onSetFilterValue.mock.calls[0][0]).toEqual(expectedListState);

    expect(requestItemsMethod.mock.calls.length).toBe(0);
  });

  test('should apply filter', async () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,
    });

    const onApplyFilter = jest.fn();

    filterlist.addListener(eventTypes.applyFilter, onApplyFilter);

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      filters: {
        test1: 'value1_1',
        test2: 'value2_1',
      },

      appliedFilters: {
        test1: 'value1_2',
        test2: 'value2_2',
      },

      items: [1, 2, 3],

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    const listStateBeforeChange = filterlist.getListStateBeforeChange();

    await filterlist.applyFilter('test2');

    const expectedListState = {
      ...listStateBeforeChange,

      appliedFilters: {
        ...listStateBeforeChange.appliedFilters,
        test2: 'value2_1',
      },
    };

    expect(filterlist.listState).toEqual(expectedListState);

    expect(onApplyFilter.mock.calls.length).toBe(1);
    expect(onApplyFilter.mock.calls[0][0]).toEqual(expectedListState);

    expect(requestItemsMethod.mock.calls.length).toBe(1);
  });

  test('should set and apply filter', async () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,
    });

    const onSetAndApplyFilter = jest.fn();

    filterlist.addListener(eventTypes.setAndApplyFilter, onSetAndApplyFilter);

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      filters: {
        test1: 'value1_1',
        test2: 'value2_1',
      },

      appliedFilters: {
        test1: 'value1_2',
        test2: 'value2_2',
      },

      items: [1, 2, 3],

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    const listStateBeforeChange = filterlist.getListStateBeforeChange();

    await filterlist.setAndApplyFilter('test2', 'value2_3');

    const expectedListState = {
      ...listStateBeforeChange,

      filters: {
        ...listStateBeforeChange.filters,
        test2: 'value2_3',
      },

      appliedFilters: {
        ...listStateBeforeChange.appliedFilters,
        test2: 'value2_3',
      },
    };

    expect(filterlist.listState).toEqual(expectedListState);

    expect(onSetAndApplyFilter.mock.calls.length).toBe(1);
    expect(onSetAndApplyFilter.mock.calls[0][0]).toEqual(expectedListState);

    expect(requestItemsMethod.mock.calls.length).toBe(1);
  });

  test('should reset filter', async () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,

      initialFilters: {
        test2: 'value2_3',
      },
    });

    const onResetFilter = jest.fn();

    filterlist.addListener(eventTypes.resetFilter, onResetFilter);

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      filters: {
        test1: 'value1_1',
        test2: 'value2_1',
      },

      appliedFilters: {
        test1: 'value1_2',
        test2: 'value2_2',
      },

      items: [1, 2, 3],

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    const listStateBeforeChange = filterlist.getListStateBeforeChange();

    await filterlist.resetFilter('test2');

    const expectedListState = {
      ...listStateBeforeChange,

      filters: {
        ...listStateBeforeChange.filters,
        test2: 'value2_3',
      },

      appliedFilters: {
        ...listStateBeforeChange.appliedFilters,
        test2: 'value2_3',
      },
    };

    expect(filterlist.listState).toEqual(expectedListState);

    expect(onResetFilter.mock.calls.length).toBe(1);
    expect(onResetFilter.mock.calls[0][0]).toEqual(expectedListState);

    expect(requestItemsMethod.mock.calls.length).toBe(1);
  });

  test('should set values of multiple filters', () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,
    });

    const onSetFiltersValues = jest.fn();

    filterlist.addListener(eventTypes.setFiltersValues, onSetFiltersValues);

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      filters: {
        test1: 'value1',
        test2: 'value2',
      },

      items: [1, 2, 3],

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    filterlist.setFiltersValues({
      test2: 'value3',
      test3: 'value4',
    });

    const expectedListState = {
      ...nextState,

      filters: {
        ...nextState.filters,
        test2: 'value3',
        test3: 'value4',
      },
    };

    expect(filterlist.listState).toEqual(expectedListState);

    expect(onSetFiltersValues.mock.calls.length).toBe(1);
    expect(onSetFiltersValues.mock.calls[0][0]).toEqual(expectedListState);

    expect(requestItemsMethod.mock.calls.length).toBe(0);
  });

  test('should apply multiple filters', async () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,
    });

    const onApplyFilters = jest.fn();

    filterlist.addListener(eventTypes.applyFilters, onApplyFilters);

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      filters: {
        test1: 'value1_1',
        test2: 'value2_1',
        test3: 'value3_1',
      },

      appliedFilters: {
        test1: 'value1_2',
        test2: 'value2_2',
        test3: 'value3_2',
      },

      items: [1, 2, 3],

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    const listStateBeforeChange = filterlist.getListStateBeforeChange();

    await filterlist.applyFilters(['test2', 'test3']);

    const expectedListState = {
      ...listStateBeforeChange,

      appliedFilters: {
        ...listStateBeforeChange.appliedFilters,
        test2: 'value2_1',
        test3: 'value3_1',
      },
    };

    expect(filterlist.listState).toEqual(expectedListState);

    expect(onApplyFilters.mock.calls.length).toBe(1);
    expect(onApplyFilters.mock.calls[0][0]).toEqual(expectedListState);

    expect(requestItemsMethod.mock.calls.length).toBe(1);
  });

  test('should set and apply multiple filters', async () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,
    });

    const onSetAndApplyFilters = jest.fn();

    filterlist.addListener(eventTypes.setAndApplyFilters, onSetAndApplyFilters);

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      filters: {
        test1: 'value1_1',
        test2: 'value2_1',
      },

      appliedFilters: {
        test1: 'value1_2',
        test2: 'value2_2',
      },

      items: [1, 2, 3],

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    const listStateBeforeChange = filterlist.getListStateBeforeChange();

    await filterlist.setAndApplyFilters({
      test2: 'value2_3',
      test3: 'value3_3',
    });

    const expectedListState = {
      ...listStateBeforeChange,

      filters: {
        ...listStateBeforeChange.filters,
        test2: 'value2_3',
        test3: 'value3_3',
      },

      appliedFilters: {
        ...listStateBeforeChange.appliedFilters,
        test2: 'value2_3',
        test3: 'value3_3',
      },
    };

    expect(filterlist.listState).toEqual(expectedListState);

    expect(onSetAndApplyFilters.mock.calls.length).toBe(1);
    expect(onSetAndApplyFilters.mock.calls[0][0]).toEqual(expectedListState);

    expect(requestItemsMethod.mock.calls.length).toBe(1);
  });

  test('should reset multiple filters', async () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,

      initialFilters: {
        test2: 'value2_3',
        test3: 'value3_3',
      },
    });

    const onResetFilters = jest.fn();

    filterlist.addListener(eventTypes.resetFilters, onResetFilters);

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      filters: {
        test1: 'value1_1',
        test2: 'value2_1',
        test3: 'value3_1',
      },

      appliedFilters: {
        test1: 'value1_2',
        test2: 'value2_2',
        test3: 'value3_2',
      },

      items: [1, 2, 3],

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    const listStateBeforeChange = filterlist.getListStateBeforeChange();

    await filterlist.resetFilters(['test2', 'test3']);

    const expectedListState = {
      ...listStateBeforeChange,

      filters: {
        ...listStateBeforeChange.filters,
        test2: 'value2_3',
        test3: 'value3_3',
      },

      appliedFilters: {
        ...listStateBeforeChange.appliedFilters,
        test2: 'value2_3',
        test3: 'value3_3',
      },
    };

    expect(filterlist.listState).toEqual(expectedListState);

    expect(onResetFilters.mock.calls.length).toBe(1);
    expect(onResetFilters.mock.calls[0][0]).toEqual(expectedListState);

    expect(requestItemsMethod.mock.calls.length).toBe(1);
  });

  test('should reset all filters', async () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,

      initialFilters: {
        test1: 'value1_3',
        test2: 'value2_3',
        test3: 'value3_3',
      },

      saveFiltersOnResetAll: ['test1', 'test3'],
    });

    const onResetAllFilters = jest.fn();

    filterlist.addListener(eventTypes.resetAllFilters, onResetAllFilters);

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      filters: {
        test1: 'value1_1',
        test2: 'value2_1',
        test3: 'value3_1',
      },

      appliedFilters: {
        test1: 'value1_2',
        test2: 'value2_2',
        test3: 'value3_2',
      },

      items: [1, 2, 3],

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    const listStateBeforeChange = filterlist.getListStateBeforeChange();

    await filterlist.resetAllFilters();

    const expectedListState = {
      ...listStateBeforeChange,

      filters: {
        ...listStateBeforeChange.filters,
        test2: 'value2_3',
      },

      appliedFilters: {
        ...listStateBeforeChange.appliedFilters,
        test2: 'value2_3',
      },
    };

    expect(filterlist.listState).toEqual(expectedListState);

    expect(onResetAllFilters.mock.calls.length).toBe(1);
    expect(onResetAllFilters.mock.calls[0][0]).toEqual(expectedListState);

    expect(requestItemsMethod.mock.calls.length).toBe(1);
  });

  test('should set sorting with asc is isDefaultSortAsc (false)', async () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,

      isDefaultSortAsc: false,
    });

    const onSetSorting = jest.fn();

    filterlist.addListener(eventTypes.setSorting, onSetSorting);

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      items: [1, 2, 3],

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    const listStateBeforeChange = filterlist.getListStateBeforeChange();

    await filterlist.setSorting('sortParam');

    const expectedListState = {
      ...listStateBeforeChange,

      sort: {
        param: 'sortParam',
        asc: false,
      },
    };

    expect(filterlist.listState).toEqual(expectedListState);

    expect(onSetSorting.mock.calls.length).toBe(1);
    expect(onSetSorting.mock.calls[0][0]).toEqual(expectedListState);

    expect(requestItemsMethod.mock.calls.length).toBe(1);
  });

  test('should set sorting with asc is isDefaultSortAsc (true)', async () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,

      isDefaultSortAsc: true,
    });

    const onSetSorting = jest.fn();

    filterlist.addListener(eventTypes.setSorting, onSetSorting);

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      items: [1, 2, 3],

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    const listStateBeforeChange = filterlist.getListStateBeforeChange();

    await filterlist.setSorting('sortParam');

    const expectedListState = {
      ...listStateBeforeChange,

      sort: {
        param: 'sortParam',
        asc: true,
      },
    };

    expect(filterlist.listState).toEqual(expectedListState);

    expect(onSetSorting.mock.calls.length).toBe(1);
    expect(onSetSorting.mock.calls[0][0]).toEqual(expectedListState);

    expect(requestItemsMethod.mock.calls.length).toBe(1);
  });

  test('should change sort asc', async () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,

      isDefaultSortAsc: true,

      sort: {
        param: 'sortParam',
        asc: true,
      },
    });

    const onSetSorting = jest.fn();

    filterlist.addListener(eventTypes.setSorting, onSetSorting);

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      items: [1, 2, 3],

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    const listStateBeforeChange = filterlist.getListStateBeforeChange();

    await filterlist.setSorting('sortParam');

    const expectedListState = {
      ...listStateBeforeChange,

      sort: {
        param: 'sortParam',
        asc: false,
      },
    };

    expect(filterlist.listState).toEqual(expectedListState);

    expect(onSetSorting.mock.calls.length).toBe(1);
    expect(onSetSorting.mock.calls[0][0]).toEqual(expectedListState);

    expect(requestItemsMethod.mock.calls.length).toBe(1);
  });

  test('should set sorting with asc from arguments', async () => {
    const filterlist = new ManualFilterlist({
      ...defaultParams,

      isDefaultSortAsc: false,
    });

    const onSetSorting = jest.fn();

    filterlist.addListener(eventTypes.setSorting, onSetSorting);

    const prevState = filterlist.getListState();

    const nextState = {
      ...prevState,

      items: [1, 2, 3],

      additional: {
        count: 3,
      },
    };

    filterlist.listState = nextState;

    const listStateBeforeChange = filterlist.getListStateBeforeChange();

    await filterlist.setSorting('sortParam', true);

    const expectedListState = {
      ...listStateBeforeChange,

      sort: {
        param: 'sortParam',
        asc: true,
      },
    };

    expect(filterlist.listState).toEqual(expectedListState);

    expect(onSetSorting.mock.calls.length).toBe(1);
    expect(onSetSorting.mock.calls[0][0]).toEqual(expectedListState);

    expect(requestItemsMethod.mock.calls.length).toBe(1);
  });
});
