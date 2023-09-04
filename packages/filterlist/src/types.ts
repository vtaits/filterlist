export type Sort = {
	param: string | null;
	asc: boolean;
};

export type ListState<Item, Additional, Error> = {
	sort: Sort;
	filters: Record<string, unknown>;
	appliedFilters: Record<string, unknown>;
	loading: boolean;
	items: Item[];
	loadedPages: number;
	additional: Additional;
	error: Error | null;
	shouldClean: boolean;
	isFirstLoad: boolean;
};

export type Options = {
	autoload: boolean;
	isDefaultSortAsc: boolean;
	alwaysResetFilters: Record<string, unknown>;
	resetFiltersTo: Record<string, unknown>;
	saveFiltersOnResetAll: string[];
	saveItemsWhileLoad: boolean;
};

export type ItemsLoaderResponse<Item, Additional> = {
	items: Item[];
	additional?: Additional;
};

export type ItemsLoader<Item, Additional, Error> = (
	prevListState: ListState<Item, Additional, Error>,
) =>
	| ItemsLoaderResponse<Item, Additional>
	| Promise<ItemsLoaderResponse<Item, Additional>>;

export type Params<Item, Additional, Error> = {
	loadItems: ItemsLoader<Item, Additional, Error>;
	items?: Item[];
	sort?: Sort;
	additional?: Additional;
	appliedFilters?: Record<string, unknown>;
	autoload?: boolean;
	isDefaultSortAsc?: boolean;
	alwaysResetFilters?: Record<string, unknown>;
	resetFiltersTo?: Record<string, unknown>;
	saveFiltersOnResetAll?: string[];
	saveItemsWhileLoad?: boolean;
};

export type EventType =
	| "loadMore"
	| "setFilterValue"
	| "applyFilter"
	| "setAndApplyFilter"
	| "resetFilter"
	| "setFiltersValues"
	| "applyFilters"
	| "setAndApplyFilters"
	| "resetFilters"
	| "resetAllFilters"
	| "reload"
	| "setSorting"
	| "resetSorting"
	| "setFiltersAndSorting"
	| "changeLoadParams"
	| "insertItem"
	| "deleteItem"
	| "updateItem"
	| "requestItems"
	| "loadItemsSuccess"
	| "loadItemsError"
	| "changeListState";
