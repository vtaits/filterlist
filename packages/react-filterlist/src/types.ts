import type {
	Params as BaseParams,
	UpdateStateParams,
} from "@vtaits/filterlist";
import type { AnySignal } from "@vtaits/react-signals";

export type AsyncParsedFiltersAndSort = Promise<UpdateStateParams>;

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
	valueSignal: AnySignal<Value | null>;
	appliedValueSignal: AnySignal<Value | null>;
}>;
