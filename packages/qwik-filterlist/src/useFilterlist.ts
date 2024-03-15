/**
 * TO DO: add tests
 */

import {
	type NoSerialize,
	type QRL,
	type Signal,
	type Tracker,
	noSerialize,
	useSignal,
	useVisibleTask$,
} from "@builder.io/qwik";

import { Filterlist, eventTypes } from "@vtaits/filterlist";
import type {
	ItemsLoader,
	ListState,
	UpdateStateParams,
} from "@vtaits/filterlist";

import isPromise from "is-promise";

import { defaultShouldRecount } from "./defaultShouldRecount";

import type {
	AsyncParams,
	AsyncParsedFiltersAndSort,
	OnChangeLoadParams,
	Params,
} from "./types";

type SyncListState = () => void;

type GetFilterlistOptionsRestul<Item, Additional, Error, FiltersAndSortData> =
	| Params<Item, Additional, Error, FiltersAndSortData>
	| AsyncParams<Item, Additional, Error, FiltersAndSortData>;

const getFilterlistOptions = <Item, Additional, Error, FiltersAndSortData>(
	params: Params<Item, Additional, Error, FiltersAndSortData>,
	loadItems$: QRL<ItemsLoader<Item, Additional, Error>>,
): GetFilterlistOptionsRestul<Item, Additional, Error, FiltersAndSortData> => {
	const { parseFiltersAndSort$, filtersAndSortData } = params;

	if (parseFiltersAndSort$ && typeof filtersAndSortData !== "undefined") {
		const parseResult = parseFiltersAndSort$(filtersAndSortData);

		if (isPromise(parseResult)) {
			return (parseResult as AsyncParsedFiltersAndSort).then(
				(parsedFiltersAndSort) => ({
					...params,
					...parsedFiltersAndSort,
					loadItems$,
				}),
			);
		}

		return {
			...params,
			...(parseResult as UpdateStateParams),
			loadItems$,
		};
	}

	return {
		...params,
		loadItems$,
	};
};

const createFilterlist = <Item, Additional, Error, FiltersAndSortData>(
	{
		loadItems$,
		...restOptions
	}: Params<Item, Additional, Error, FiltersAndSortData>,
	syncListState: SyncListState,
	onChangeLoadParams$: QRL<OnChangeLoadParams<Item, Additional, Error>> | null,
): Filterlist<Item, Additional, Error> => {
	const filterlist = new Filterlist<Item, Additional, Error>({
		...restOptions,
		loadItems: loadItems$,
	});

	filterlist.emitter.on(eventTypes.changeListState, syncListState);

	if (onChangeLoadParams$) {
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams$);
	}

	return filterlist;
};

const initFilterlist = <Item, Additional, Error, FiltersAndSortData>(
	params: Params<Item, Additional, Error, FiltersAndSortData>,
	loadItems$: QRL<ItemsLoader<Item, Additional, Error>>,
	syncListState: SyncListState,
	onChangeLoadParams$: QRL<OnChangeLoadParams<Item, Additional, Error>> | null,
):
	| Filterlist<Item, Additional, Error>
	| Promise<Filterlist<Item, Additional, Error>> => {
	const optionsResult = getFilterlistOptions(params, loadItems$);

	if (isPromise(optionsResult)) {
		return (
			optionsResult as AsyncParams<Item, Additional, Error, FiltersAndSortData>
		).then((options) =>
			createFilterlist(options, syncListState, onChangeLoadParams$),
		);
	}

	return createFilterlist(
		optionsResult as Params<Item, Additional, Error, FiltersAndSortData>,
		syncListState,
		onChangeLoadParams$,
	);
};

export const useFilterlist = <Item, Additional, Error, FiltersAndSortData>(
	params: Params<Item, Additional, Error, FiltersAndSortData>,
	trackInputs?: (params: {
		track: Tracker;
	}) => void,
): [
	Signal<ListState<Item, Additional, Error> | null>,
	Filterlist<Item, Additional, Error> | null,
] => {
	const {
		parseFiltersAndSort$ = null,
		filtersAndSortData = null,
		shouldRecount = defaultShouldRecount,
		onChangeLoadParams$ = null,
		loadItems$,
		canInit = true,
	} = params;

	const isInitInProgressRef = useSignal(false);

	const filterlistRef =
		useSignal<NoSerialize<Filterlist<Item, Additional, Error>>>();

	const syncListState = (): void => {
		listState.value = filterlistRef.value
			? filterlistRef.value.getListState()
			: null;
	};

	const initFilterlistInComponent = noSerialize((isInEffect: boolean): void => {
		if (!filterlistRef.value && !isInitInProgressRef.value) {
			const filterlistResult = initFilterlist(
				params,
				loadItems$,
				syncListState,
				onChangeLoadParams$,
			);

			if (isPromise(filterlistResult)) {
				isInitInProgressRef.value = true;

				(filterlistResult as Promise<Filterlist<Item, Additional, Error>>).then(
					(filterlist) => {
						filterlistRef.value = noSerialize(filterlist);
						isInitInProgressRef.value = false;

						listState.value = filterlist.getListState();
					},
				);
			} else {
				filterlistRef.value = noSerialize(
					filterlistResult as Filterlist<Item, Additional, Error>,
				);
			}
		}

		if (isInEffect) {
			syncListState();
		}
	});

	if (canInit) {
		initFilterlistInComponent?.(false);
	}

	const listState = useSignal<ListState<Item, Additional, Error> | null>(
		filterlistRef.value ? filterlistRef.value.getListState() : null,
	);

	const filtersAndSortDataRef = useSignal(filtersAndSortData);
	if (
		parseFiltersAndSort$ &&
		filtersAndSortData &&
		filtersAndSortDataRef.value &&
		shouldRecount(filtersAndSortData, filtersAndSortDataRef.value)
	) {
		(async (): Promise<void> => {
			const parsedFiltersAndSort =
				await parseFiltersAndSort$(filtersAndSortData);

			const filterlist = filterlistRef.value;

			if (filterlist) {
				filterlist.updateStateAndRequest(parsedFiltersAndSort);
			}
		})();
	}
	filtersAndSortDataRef.value = filtersAndSortData;

	useVisibleTask$(({ track }) => {
		track(() => canInit);
		if (trackInputs) {
			trackInputs({ track });
		}

		if (!canInit) {
			return undefined;
		}

		initFilterlistInComponent?.(true);

		return () => {
			if (filterlistRef.value) {
				filterlistRef.value.emitter.off(eventTypes.changeListState);
				filterlistRef.value.emitter.off(eventTypes.changeLoadParams);
			}

			filterlistRef.value = undefined;
			isInitInProgressRef.value = false;
		};
	});

	return [listState, filterlistRef.value || null];
};
