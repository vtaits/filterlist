import type {
  Params,
  ListState,
} from './types';

import listInitialState from './listInitialState';

const collectListInitialState = <Item = any, Additional = any>(
  params: Params<Item, Additional>,
): ListState<Item, Additional> => ({
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
  });

export default collectListInitialState;
