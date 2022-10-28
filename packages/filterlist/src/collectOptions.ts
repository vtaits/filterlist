import type {
  Options,
  Params,
} from './types';

export const defaultOptions: Options = {
  autoload: true,
  isDefaultSortAsc: true,
  alwaysResetFilters: {},
  resetFiltersTo: {},
  saveFiltersOnResetAll: [],
  saveItemsWhileLoad: false,
};

export const collectOptions = <Item, Additional, Error>(
  params: Params<Item, Additional, Error>,
): Options => ({
    ...defaultOptions,

    autoload: typeof params.autoload === 'boolean'
      ? params.autoload
      : defaultOptions.autoload,

    isDefaultSortAsc: typeof params.isDefaultSortAsc === 'boolean'
      ? params.isDefaultSortAsc
      : defaultOptions.isDefaultSortAsc,

    alwaysResetFilters: params.alwaysResetFilters
      || defaultOptions.alwaysResetFilters,

    resetFiltersTo: params.resetFiltersTo
      || defaultOptions.resetFiltersTo,

    saveFiltersOnResetAll: params.saveFiltersOnResetAll
      || defaultOptions.saveFiltersOnResetAll,

    saveItemsWhileLoad: params.saveItemsWhileLoad
      || defaultOptions.saveItemsWhileLoad,
  });
