export type Sort = {
  param: string;
  asc: boolean;
};

export type ListState<Item = any, Additional = any, Error = any> = {
  sort: Sort;
  filters: Record<string, any>;
  appliedFilters: Record<string, any>;
  loading: boolean;
  items: Item[];
  additional: Additional;
  error: Error;
  shouldClean: boolean;
  isFirstLoad: boolean;
};

export type Options = {
  autoload: boolean;
  isDefaultSortAsc: boolean;
  alwaysResetFilters: Record<string, any>;
  initialFilters: Record<string, any>;
  saveFiltersOnResetAll: string[];
  saveItemsWhileLoad: boolean;
};

export type ItemsLoader<Item = any, Additional = any, Error = any> = (
  prevListState: ListState<Item, Additional, Error>,
) => Promise<{
  items: Item[];
  additional: Additional;
}>;

export type Params<Item = any, Additional = any, Error = any> = {
  loadItems: ItemsLoader<Item, Additional, Error>;
  items: Item[];
  sort: Sort;
  additional: Additional;
  appliedFilters: Record<string, any>;
  autoload?: boolean;
  isDefaultSortAsc?: boolean;
  alwaysResetFilters?: Record<string, any>;
  initialFilters: Record<string, any>;
  saveFiltersOnResetAll: string[];
  saveItemsWhileLoad: boolean;
};

export type EventType = 'loadMore'
| 'setFilterValue'
| 'applyFilter'
| 'setAndApplyFilter'
| 'resetFilter'
| 'setFiltersValues'
| 'applyFilters'
| 'setAndApplyFilters'
| 'resetFilters'
| 'resetAllFilters'
| 'setSorting'
| 'resetSorting'
| 'setFiltersAndSorting'
| 'changeLoadParams'
| 'insertItem'
| 'deleteItem'
| 'updateItem'
| 'requestItems'
| 'loadItemsSuccess'
| 'loadItemsError'
| 'changeListState';
