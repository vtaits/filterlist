const listInitialState = {
  sort: {
    param: null,
    asc: true,
  },
  filters: {},
  appliedFilters: {},
  loading: false,
  items: [],
  additional: null,
  error: null,
  shouldClean: false,
  isFirstLoad: true,
};

export default listInitialState;
