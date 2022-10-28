import type {
  Params,
  ListState,
} from './types';

import {
  listInitialState as defaultListInitialState,
} from './listInitialState';

export const collectListInitialState = <Item, Additional, Error>(
  params: Params<Item, Additional, Error>,
): ListState<Item, Additional, Error> => {
  const listInitialState = defaultListInitialState as ListState<Item, Additional, Error>;

  return {
    ...listInitialState as ListState<Item, Additional, Error>,

    items: params.items || listInitialState.items,
    loadedPages: (params.items && params.items.length > 0)
      ? 1
      : listInitialState.loadedPages,

    sort: params.sort || listInitialState.sort,

    /* eslint-disable no-prototype-builtins */
    additional: params.hasOwnProperty('additional')
      ? params.additional as Additional
      : listInitialState.additional,
    /* eslint-enable no-prototype-builtins */

    filters: params.appliedFilters
      || listInitialState.filters,

    appliedFilters: params.appliedFilters
      || listInitialState.appliedFilters,
  };
};
