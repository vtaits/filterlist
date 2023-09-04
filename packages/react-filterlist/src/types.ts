import type { ListState, Sort, Params as BaseParams } from "@vtaits/filterlist";

export type ParsedFiltersAndSort = {
	readonly filters: Readonly<Record<string, unknown>>;
	readonly appliedFilters: Readonly<Record<string, unknown>>;
	readonly sort: Sort;
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

export type Params<Item, Additional, Error, FiltersAndSortData> = BaseParams<
	Item,
	Additional,
	Error
> & {
	readonly parseFiltersAndSort?: ParseFiltersAndSort<FiltersAndSortData>;
	readonly filtersAndSortData?: FiltersAndSortData;
	readonly shouldRecount?: ShouldRecount<FiltersAndSortData>;
	readonly canInit?: boolean;
	readonly onChangeLoadParams?: OnChangeLoadParams<Item, Additional, Error>;
};

export type AsyncParams<Item, Additional, Error, FiltersAndSortData> = Promise<
	Params<Item, Additional, Error, FiltersAndSortData>
>;
