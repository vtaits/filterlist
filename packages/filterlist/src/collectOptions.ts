import type { Options, Params } from "./types";

export const defaultOptions: Options = {
	alwaysResetFilters: {},
	autoload: true,
	debounceTimeout: undefined,
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
