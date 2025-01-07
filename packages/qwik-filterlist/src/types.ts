import type { QRL } from "@builder.io/qwik";
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
	Omit<BaseParams<Item, Additional, Error>, "loadItems"> & {
		/**
		 * function that loads items into the list
		 *
		 * @throws
		 */
		loadItems$: QRL<BaseParams<Item, Additional, Error>["loadItems"]>;
		parseFiltersAndSort$?: QRL<ParseFiltersAndSort<FiltersAndSortData>>;
		filtersAndSortData?: FiltersAndSortData;
		shouldRecount?: ShouldRecount<FiltersAndSortData>;
		canInit?: boolean;
		onChangeLoadParams$?: QRL<OnChangeLoadParams<Item, Additional, Error>>;
	}
>;

export type AsyncParams<Item, Additional, Error, FiltersAndSortData> = Promise<
	Params<Item, Additional, Error, FiltersAndSortData>
>;
