export type Sort = {
	readonly param?: string | null;
	readonly asc: boolean;
};

export type ListState<Item, Additional, Error> = {
	readonly sort: Sort;
	readonly filters: Record<string, unknown>;
	readonly appliedFilters: Record<string, unknown>;
	readonly loading: boolean;
	readonly items: readonly Item[];
	readonly loadedPages: number;
	readonly additional: Additional;
	readonly error: Error | null;
	readonly shouldClean: boolean;
	readonly isFirstLoad: boolean;
};

export type Options = {
	readonly autoload: boolean;
	readonly isDefaultSortAsc: boolean;
	readonly alwaysResetFilters: Readonly<Record<string, unknown>>;
	readonly resetFiltersTo: Readonly<Record<string, unknown>>;
	readonly saveFiltersOnResetAll: readonly string[];
	readonly saveItemsWhileLoad: boolean;
};

export type ItemsLoaderResponse<Item, Additional> = {
	readonly items: readonly Item[];
	readonly additional?: Additional;
};

export type ItemsLoader<Item, Additional, Error> = (
	prevListState: ListState<Item, Additional, Error>,
) =>
	| ItemsLoaderResponse<Item, Additional>
	| Promise<ItemsLoaderResponse<Item, Additional>>;

export type Params<Item, Additional, Error> = {
	readonly loadItems: ItemsLoader<Item, Additional, Error>;
	readonly items?: readonly Item[];
	readonly sort?: Sort;
	readonly additional?: Additional;
	readonly appliedFilters?: Readonly<Record<string, unknown>>;
	readonly autoload?: boolean;
	readonly isDefaultSortAsc?: boolean;
	readonly alwaysResetFilters?: Readonly<Record<string, unknown>>;
	readonly resetFiltersTo?: Readonly<Record<string, unknown>>;
	readonly saveFiltersOnResetAll?: readonly string[];
	readonly saveItemsWhileLoad?: boolean;
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
