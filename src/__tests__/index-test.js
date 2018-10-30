import Filterlist from '../index';

import collectListInitialState from '../collectListInitialState';
import collectOptions from '../collectOptions';

test('should collect listState on init', () => {
  const params = {
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

  const filterlist = new Filterlist(params);

  expect(filterlist.getListState())
    .toEqual(collectListInitialState(params));
});

test('should collect options on init', () => {
  const params = {
    alwaysResetFilters: {
      filter1: 'value1',
      filter2: 'value2',
    },
    saveFiltersOnResetAll: ['filter1', 'filter2'],
    saveItemsWhileLoad: true,
    autoload: false,
    isDefaultSortAsc: true,
  };

  const filterlist = new Filterlist(params);

  expect(filterlist.options)
    .toEqual(collectOptions(params));
});

test('should set initial requestId', () => {
  const filterlist = new Filterlist({});

  expect(filterlist.requestId).toBe(0);
});
