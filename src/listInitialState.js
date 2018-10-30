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
};

export default listInitialState;
