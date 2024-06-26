export type Sort = Readonly<{
	param?: string | null;
	asc: boolean;
}>;

export type ListState<Item, Additional, Error> = Readonly<{
	/**
	 * sorting state of the list
	 */
	sort: Sort;
	/**
	 * current filters state on page (intermediate inputs values etc.)
	 */
	filters: Record<string, unknown>;
	/**
	 * applied filters
	 */
	appliedFilters: Record<string, unknown>;
	/**
	 * is list loading at this moment
	 */
	loading: boolean;
	/**
	 * loaded items
	 */
	items: readonly Item[];
	/**
	 * number of pages that loaded without changing filters or sorting
	 */
	loadedPages: number;
	/**
	 * additional info that can be recieved together with items
	 */
	additional: Additional;
	/**
	 * error that can be received if list not loaded
	 */
	error: Error | null;
	shouldClean: boolean;
	/**
	 * is the first load after initialization
	 */
	isFirstLoad: boolean;
	page: number;
	pageSize?: number | null;
	total?: number | null;
}>;

export type Options = Readonly<{
	autoload: boolean;
	debounceTimeout?: number;
	isDefaultSortAsc: boolean;
	alwaysResetFilters: Readonly<Record<string, unknown>>;
	refreshTimeout?: number;
	resetFiltersTo: Readonly<Record<string, unknown>>;
	saveFiltersOnResetAll: readonly string[];
	saveItemsWhileLoad: boolean;
}>;

/**
 * respose of the items loader
 */
export type ItemsLoaderResponse<Item, Additional> = Readonly<{
	/**
	 * loaded list of data
	 */
	items: readonly Item[];
	/**
	 * additional metadata that can be stored in list state
	 */
	additional?: Additional;
	/**
	 * total number of items
	 */
	total?: number | null;
}>;

/**
 * @param prevState list state of the previous request
 * @param nextState current list state
 */
export type ShouldRequest<Item, Additional, Error> = (
	prevState: ListState<Item, Additional, Error>,
	nextState: ListState<Item, Additional, Error>,
) => boolean;

/**
 * function that loads items into the list
 *
 * @throws {LoadListError} if an error occured during load items
 */
export type ItemsLoader<Item, Additional, Error> = (
	prevListState: ListState<Item, Additional, Error>,
) =>
	| ItemsLoaderResponse<Item, Additional>
	| Promise<ItemsLoaderResponse<Item, Additional>>;

export type Params<Item, Additional, Error> = Readonly<{
	/**
	 * invoked before requests. If returns `false`, request will be prevented
	 */
	shouldRequest?: ShouldRequest<Item, Additional, Error>;
	/**
	 * function that loads items into the list
	 *
	 * @throws
	 */
	loadItems: ItemsLoader<Item, Additional, Error>;
	/**
	 * initially defined list of items
	 */
	items?: readonly Item[];
	/**
	 * initial sorting
	 */
	sort?: Sort;
	/**
	 * initial additional metadata
	 */
	additional?: Additional;
	/**
	 * filters and their values that applied by default
	 */
	appliedFilters?: Readonly<Record<string, unknown>>;
	/**
	 * request items on init
	 *
	 * @default true
	 */
	autoload?: boolean;
	/**
	 * debounce timeout to prevent extra requests
	 */
	debounceTimeout?: number;
	/**
	 * default `asc` param after change sorting column
	 *
	 * @default true
	 */
	isDefaultSortAsc?: boolean;
	/**
	 * filters and their values that  will be set after every filters or sorting change
	 */
	alwaysResetFilters?: Readonly<Record<string, unknown>>;
	/**
	 * filters and their values that will be set after filter reset
	 */
	resetFiltersTo?: Readonly<Record<string, unknown>>;
	/**
	 * filter names that will not reset after `resetAllFilters` call
	 */
	saveFiltersOnResetAll?: readonly string[];
	/**
	 * by default items are cleared if filters or sorting changed. If `saveItemsWhileLoad` is `true`, previous list items are saved while load request is pending
	 *
	 * @default false
	 */
	saveItemsWhileLoad?: boolean;
	/**
	 * initial page
	 */
	page?: number | null;
	/**
	 * initial size of the page
	 */
	pageSize?: number | null;
	/**
	 * timeout to refresh the list
	 */
	refreshTimeout?: number;
	/**
	 * total count of items
	 */
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
