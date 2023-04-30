import type {
  ReactNode,
} from 'react';

import type {
  ListState,
  Sort,
  Params as BaseParams,
} from '@vtaits/filterlist';

export type ParsedFiltersAndSort = {
  filters: Record<string, any>;
  appliedFilters: Record<string, any>;
  sort: Sort;
};

export type AsyncParsedFiltersAndSort = Promise<ParsedFiltersAndSort>;

export type OnChangeLoadParams<Item, Additional, Error> = (
  listState: ListState<Item, Additional, Error>,
) => void;

export type ShouldRecount<FiltersAndSortData> = (
  nextData: FiltersAndSortData,
  prevData: FiltersAndSortData,
) => boolean;

export type ParseFiltersAndSort<FiltersAndSortData> = (
  data: FiltersAndSortData,
) => ParsedFiltersAndSort | AsyncParsedFiltersAndSort;

export type Params<Item, Additional, Error, FiltersAndSortData> =
  & BaseParams<Item, Additional, Error>
  & {
    filtersAndSortData?: FiltersAndSortData;
    parseFiltersAndSort?: ParseFiltersAndSort<FiltersAndSortData>;
    shouldRecount?: ShouldRecount<FiltersAndSortData>;
    canInit?: boolean;
    onChangeLoadParams?: OnChangeLoadParams<Item, Additional, Error>;
  };

export type ComponentListActions<Item, Additional> = {
  loadMore: () => Promise<void>;
  setFilterValue: (filterName: string, value: any) => void;
  applyFilter: (filterName: string) => Promise<void>;
  setAndApplyFilter: (filterName: string, value: any) => Promise<void>;
  resetFilter: (filterName: string) => Promise<void>;
  setFiltersValues: (values: Record<string, any>) => void;
  applyFilters: (filtersNames: string[]) => Promise<void>;
  setAndApplyFilters: (values: Record<string, any>) => Promise<void>;
  resetFilters: (filtersNames: string[]) => Promise<void>;
  resetAllFilters: () => Promise<void>;
  reload: () => Promise<void>;
  setSorting: (param: string, asc?: boolean) => Promise<void>;
  resetSorting: () => Promise<void>;
  insertItem: (itemIndex: number, item: Item, additional?: Additional) => void;
  deleteItem: (itemIndex: number, additional?: Additional) => void;
  updateItem: (itemIndex: number, item: Item, additional?: Additional) => void;
};

export type ComponentRenderProps<Item, Additional, Error> = {
  isListInited: boolean;
  listState: ListState<Item, Additional, Error> | null;
  listActions: ComponentListActions<Item, Additional> | null;
};

export type ComponentParams<Item, Additional, Error, FiltersAndSortData> =
  & BaseParams<Item, Additional, Error>
  & {
    filtersAndSortData?: FiltersAndSortData;
    parseFiltersAndSort?: (data: FiltersAndSortData) => ParsedFiltersAndSort
    | AsyncParsedFiltersAndSort;
    shouldRecount?: ShouldRecount<FiltersAndSortData>;
    isRecountAsync?: boolean;
    onChangeLoadParams?: OnChangeLoadParams<Item, Additional, Error>;

    children: (renderProps: ComponentRenderProps<Item, Additional, Error>) => ReactNode;
  };

export type HOCParams<Item, Additional, Error> =
  & Omit<BaseParams<Item, Additional, Error>, 'loadItems'>
  & {
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
Item,
Additional,
Error,
FiltersAndSortData,
> = Promise<Params<Item, Additional, Error, FiltersAndSortData>>;
