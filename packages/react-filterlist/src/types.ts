import type {
	Params as BaseParams,
	ListState,
	UpdateStateParams,
} from "@vtaits/filterlist";

export type AsyncParsedFiltersAndSort = Promise<UpdateStateParams>;

export type OnChangeLoadParams<Item, Additional, Error> = (
	listState: ListState<Item, Additional, Error>,
) => void;

export type ShouldRecount<FiltersAndSortData> = (
	nextData: FiltersAndSortData,
	prevData: FiltersAndSortData,
) => boolean;

export type ParseFiltersAndSort<FiltersAndSortData> = (
	data: FiltersAndSortData,
) => UpdateStateParams | AsyncParsedFiltersAndSort;

export type Params<Item, Additional, Error, FiltersAndSortData> = Readonly<
	BaseParams<Item, Additional, Error> & {
		parseFiltersAndSort?: ParseFiltersAndSort<FiltersAndSortData>;
		filtersAndSortData?: FiltersAndSortData;
		shouldRecount?: ShouldRecount<FiltersAndSortData>;
		canInit?: boolean;
		onChangeLoadParams?: OnChangeLoadParams<Item, Additional, Error>;
	}
>;

export type AsyncParams<Item, Additional, Error, FiltersAndSortData> = Promise<
	Params<Item, Additional, Error, FiltersAndSortData>
>;

export type UseFilterReturn<Value> = Readonly<{
	setFilterValue: (value: Value) => void;
	setAndApplyFilter: (value: Value) => void;
	applyFilter: () => void;
	resetFilter: () => void;
	value: Value | null;
	appliedValue: Value | null;
}>;
