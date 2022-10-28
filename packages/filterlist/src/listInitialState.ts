import type {
  ListState,
} from './types';

export const listInitialState: ListState<unknown, unknown, unknown> = {
  sort: {
    param: null,
    asc: true,
  },
  filters: {},
  appliedFilters: {},
  loading: false,
  items: [],
  loadedPages: 0,
  additional: null,
  error: null,
  shouldClean: false,
  isFirstLoad: true,
};
