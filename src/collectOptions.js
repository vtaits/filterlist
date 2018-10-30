export const defaultOptions = {
  autoload: true,
  isDefaultSortAsc: true,
  alwaysResetFilters: {},
  initialFilters: {},
  saveFiltersOnResetAll: [],
  saveItemsWhileLoad: false,
};

export default function collectOptions(params) {
  return {
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

    initialFilters: params.initialFilters
      || defaultOptions.initialFilters,

    saveFiltersOnResetAll: params.saveFiltersOnResetAll
      || defaultOptions.saveFiltersOnResetAll,

    saveItemsWhileLoad: params.saveItemsWhileLoad
      || defaultOptions.saveItemsWhileLoad,
  };
}
