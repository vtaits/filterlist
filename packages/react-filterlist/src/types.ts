import {
  ReactNode,
} from 'react';

import {
  ListState,
  Sort,
  Params as BaseParams,
} from '@vtaits/filterlist';

export type ParsedFiltersAndSort = {
  filters: Object;
  appliedFilters: Object;
  sort: Sort;
};

export type AsyncParsedFiltersAndSort = Promise<ParsedFiltersAndSort>;

export type OnChangeLoadParams<
  Item = any,
  Additional = any,
  Error = any
> = (listState: ListState<Item, Additional, Error>) => void;

export type ShouldRecount<
  FiltersAndSortData = any
> = (nextData: FiltersAndSortData, prevData: FiltersAndSortData) => boolean;

export type Params<
  Item = any,
  Additional = any,
  Error = any,
  FiltersAndSortData = any
> = BaseParams<Item, Additional, Error> & {
  filtersAndSortData?: FiltersAndSortData;
  parseFiltersAndSort?: (data: FiltersAndSortData) => ParsedFiltersAndSort
    | AsyncParsedFiltersAndSort;
  shouldRecount?: ShouldRecount<FiltersAndSortData>;
  canInit?: boolean;
  onChangeLoadParams?: OnChangeLoadParams<Item, Additional, Error>;
};

export type ComponentListActions<Item = any, Additional = any> = {
  loadItems: () => Promise<void>;
  setFilterValue: (filterName: string, value: any) => void;
  applyFilter: (filterName: string) => Promise<void>;
  setAndApplyFilter: (filterName: string, value: any) => Promise<void>;
  resetFilter: (filterName: string) => Promise<void>;
  setFiltersValues: (values: Object) => void;
  applyFilters: (filtersNames: string[]) => Promise<void>;
  setAndApplyFilters: (values: Object) => Promise<void>;
  resetFilters: (filtersNames: string[]) => Promise<void>;
  resetAllFilters: () => Promise<void>;
  setSorting: (param: string, asc?: boolean) => Promise<void>;
  resetSorting: () => Promise<void>;
  insertItem: (itemIndex: number, item: Item, additional?: Additional) => void;
  deleteItem: (itemIndex: number, additional?: Additional) => void;
  updateItem: (itemIndex: number, item: Item, additional?: Additional) => void;
};

export type ComponentRenderProps<Item = any, Additional = any, Error = any> = {
  isListInited: boolean;
  listState?: ListState<Item, Additional, Error>;
  listActions: ComponentListActions<Item, Additional>;
};

export type ComponentParams<
  Item = any,
  Additional = any,
  Error = any,
  FiltersAndSortData = any
> = BaseParams<Item, Additional, Error> & {
  filtersAndSortData?: FiltersAndSortData;
  parseFiltersAndSort?: (data: FiltersAndSortData) => ParsedFiltersAndSort
    | AsyncParsedFiltersAndSort;
  shouldRecount?: ShouldRecount<FiltersAndSortData>;
  isRecountAsync?: boolean;
  onChangeLoadParams?: OnChangeLoadParams<Item, Additional, Error>;

  children: (renderProps: ComponentRenderProps<Item, Additional, Error>) => ReactNode,
};

export type HOCParams<
  Item = any,
  Additional = any,
  Error = any
> = BaseParams<Item, Additional, Error> & {
  parseFiltersAndSort?: (data: any) => ParsedFiltersAndSort | AsyncParsedFiltersAndSort;
  shouldRecount?: ShouldRecount<any>;
  isRecountAsync?: boolean;
  onChangeLoadParams?: (listState: ListState<Item, Additional, Error>, props: any) => void;
  loadItems: (
    prevListState: ListState<Item, Additional, Error>,
    props: any,
  ) => Promise<{
    items: Item[];
    additional: Additional;
  }>;
};

export type AsyncParams<
  Item = any,
  Additional = any,
  Error = any
> = Promise<Params<Item, Additional, Error>>;
