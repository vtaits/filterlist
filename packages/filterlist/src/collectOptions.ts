import type { Options, Params } from "./types";

export const defaultOptions: Options = {
	alwaysResetFilters: {},
	autoload: true,
	debounceTimeout: undefined,
	excludeFiltersFromDataStore: new Set([]),
	filtersConfig: {},
	isDefaultSortAsc: true,
	refreshTimeout: undefined,
	resetFiltersTo: {},
	saveFiltersOnResetAll: [],
	saveItemsWhileLoad: false,
};

export const collectOptions = <Item, Additional, Error>(
	params: Params<Item, Additional, Error>,
): Options => ({
	...defaultOptions,

	autoload:
		typeof params.autoload === "boolean"
			? params.autoload
			: defaultOptions.autoload,

	debounceTimeout: params.debounceTimeout,

	excludeFiltersFromDataStore: new Set(
		params.filtersConfig
			? Object.entries(params.filtersConfig)
					.filter(
						([_, value]) => value?.store && value.store.type !== "dataStore",
					)
					.map(([filterName]) => filterName)
			: [],
	),

	filtersConfig: params.filtersConfig ?? {},

	isDefaultSortAsc:
		typeof params.isDefaultSortAsc === "boolean"
			? params.isDefaultSortAsc
			: defaultOptions.isDefaultSortAsc,

	alwaysResetFilters:
		params.alwaysResetFilters || defaultOptions.alwaysResetFilters,

	pageSizeLocalStorageKey: params.pageSizeLocalStorageKey || undefined,

	refreshTimeout: params.refreshTimeout,

	resetFiltersTo: params.resetFiltersTo || defaultOptions.resetFiltersTo,

	saveFiltersOnResetAll:
		params.saveFiltersOnResetAll || defaultOptions.saveFiltersOnResetAll,

	saveItemsWhileLoad:
		params.saveItemsWhileLoad || defaultOptions.saveItemsWhileLoad,
});
