export type Sort = Readonly<{
	param?: string | null;
	asc: boolean;
}>;

export type ListState<Item, Additional, Error> = Readonly<{
	sort: Sort;
	filters: Record<string, unknown>;
	appliedFilters: Record<string, unknown>;
	loading: boolean;
	items: readonly Item[];
	loadedPages: number;
	additional: Additional;
	error: Error | null;
	shouldClean: boolean;
	isFirstLoad: boolean;
	page: number;
	pageSize?: number | null;
	total?: number | null;
}>;

export type Options = Readonly<{
	autoload: boolean;
	isDefaultSortAsc: boolean;
	alwaysResetFilters: Readonly<Record<string, unknown>>;
	resetFiltersTo: Readonly<Record<string, unknown>>;
	saveFiltersOnResetAll: readonly string[];
	saveItemsWhileLoad: boolean;
}>;

export type ItemsLoaderResponse<Item, Additional> = Readonly<{
	items: readonly Item[];
	additional?: Additional;
	total?: number | null;
}>;

export type ShouldRequest<Item, Additional, Error> = (
	prevState: ListState<Item, Additional, Error>,
	nextState: ListState<Item, Additional, Error>,
) => boolean;

export type ItemsLoader<Item, Additional, Error> = (
	prevListState: ListState<Item, Additional, Error>,
) =>
	| ItemsLoaderResponse<Item, Additional>
	| Promise<ItemsLoaderResponse<Item, Additional>>;

export type Params<Item, Additional, Error> = Readonly<{
	shouldRequest?: ShouldRequest<Item, Additional, Error>;
	loadItems: ItemsLoader<Item, Additional, Error>;
	items?: readonly Item[];
	sort?: Sort;
	additional?: Additional;
	appliedFilters?: Readonly<Record<string, unknown>>;
	autoload?: boolean;
	isDefaultSortAsc?: boolean;
	alwaysResetFilters?: Readonly<Record<string, unknown>>;
	resetFiltersTo?: Readonly<Record<string, unknown>>;
	saveFiltersOnResetAll?: readonly string[];
	saveItemsWhileLoad?: boolean;
	page?: number | null;
	pageSize?: number | null;
	total?: number | null;
}>;

export type UpdateStateParams = Readonly<{
	filters?: Record<string, unknown>;
	appliedFilters?: Record<string, unknown>;
	sort?: Sort;
	page?: number | null;
	pageSize?: number | null;
}>;

export type EventType =
	| "loadMore"
	| "setFilterValue"
	| "applyFilter"
	| "setAndApplyFilter"
	| "resetFilter"
	| "setFiltersValues"
	| "applyFilters"
	| "setAndApplyFilters"
	| "setPage"
	| "setPageSize"
	| "resetFilters"
	| "resetAllFilters"
	| "reload"
	| "setSorting"
	| "resetSorting"
	| "updateStateAndRequest"
	| "changeLoadParams"
	| "insertItem"
	| "deleteItem"
	| "updateItem"
	| "requestItems"
	| "loadItemsSuccess"
	| "loadItemsError"
	| "changeListState";
