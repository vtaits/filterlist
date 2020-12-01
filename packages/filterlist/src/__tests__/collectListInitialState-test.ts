import { collectListInitialState } from '../collectListInitialState';
import { listInitialState } from '../listInitialState';

import type {
  ItemsLoaderResponse,
} from '../types';

const defaultParams = {
  loadItems: (): ItemsLoaderResponse<any, any> => ({
    items: [],
  }),
};

test('should return listInitialState', () => {
  expect(collectListInitialState(defaultParams)).toEqual(listInitialState);
});

test('should set initial sort', () => {
  const state = collectListInitialState({
    ...defaultParams,

    sort: {
      param: 'param',
      asc: false,
    },
  });

  expect(state.sort).toEqual({
    param: 'param',
    asc: false,
  });
});

test('should set initial filters', () => {
  const filters = {
    filter1: 'value1',
    filter2: 'value2',
    filter3: ['value3', 'value4'],
  };

  const state = collectListInitialState({
    ...defaultParams,

    appliedFilters: filters,
  });

  expect(state.filters).toEqual(filters);
  expect(state.appliedFilters).toEqual(filters);
});

test('should set additional', () => {
  const state = collectListInitialState({
    ...defaultParams,

    additional: {
      count: 0,
    },
  });

  expect(state.additional).toEqual({
    count: 0,
  });
});

test('should no set additional (null by default)', () => {
  const state = collectListInitialState({
    ...defaultParams,
  });

  expect(state.additional).toEqual(null);
});

test('should set items', () => {
  const items = [1, 2, 3];

  const state = collectListInitialState({
    ...defaultParams,
    items,
  });

  expect(state.items).toBe(items);
});
