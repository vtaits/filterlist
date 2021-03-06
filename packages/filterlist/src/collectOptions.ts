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

    /* eslint-disable no-prototype-builtins */
    autoload: params.hasOwnProperty('autoload')
      ? params.autoload
      : defaultOptions.autoload,

    /* eslint-disable no-prototype-builtins */
    isDefaultSortAsc: params.hasOwnProperty('isDefaultSortAsc')
      ? params.isDefaultSortAsc
      : defaultOptions.isDefaultSortAsc,
    /* eslint-enable no-prototype-builtins */

    alwaysResetFilters: params.alwaysResetFilters
      || defaultOptions.alwaysResetFilters,

    resetFiltersTo: params.resetFiltersTo
      || defaultOptions.resetFiltersTo,

    saveFiltersOnResetAll: params.saveFiltersOnResetAll
      || defaultOptions.saveFiltersOnResetAll,

    saveItemsWhileLoad: params.saveItemsWhileLoad
      || defaultOptions.saveItemsWhileLoad,
  });
