import listInitialState from './listInitialState';

export default function collectListInitialState(params) {
  return {
    ...listInitialState,

    items: params.items || listInitialState.items,

    sort: params.sort || listInitialState.sort,

    /* eslint-disable no-prototype-builtins */
    additional: params.hasOwnProperty('additional')
      ? params.additional
      : listInitialState.additional,
    /* eslint-enable no-prototype-builtins */

    filters: params.appliedFilters
      || listInitialState.filters,

    appliedFilters: params.appliedFilters
      || listInitialState.appliedFilters,
  };
}
