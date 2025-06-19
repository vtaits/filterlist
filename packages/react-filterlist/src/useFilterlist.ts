/**
 * TO DO: add tests
 */

import type {
	ItemsLoader,
	ListState,
	RequestParams,
	UpdateStateParams,
} from "@vtaits/filterlist";
import { Filterlist } from "@vtaits/filterlist";
import {
	type AnySignal,
	useRerender,
	useSignalComputed,
	useSignalState,
} from "@vtaits/react-signals";
import { useLatest } from "@vtaits/use-latest";
import isPromise from "is-promise";
import { useCallback, useEffect, useRef } from "react";
import { defaultShouldRecount } from "./defaultShouldRecount";
import type {
	AsyncParams,
	AsyncParsedFiltersAndSort,
	Params,
	UseFilterReturn,
} from "./types";
import { useFilter } from "./useFilter";

type GetFilterlistOptionsRestul<Item, Additional, Error, FiltersAndSortData> =
	| Params<Item, Additional, Error, FiltersAndSortData>
	| AsyncParams<Item, Additional, Error, FiltersAndSortData>;

const getFilterlistOptions = <Item, Additional, Error, FiltersAndSortData>(
	params: Params<Item, Additional, Error, FiltersAndSortData>,
	loadItems: ItemsLoader<Item, Additional, Error>,
): GetFilterlistOptionsRestul<Item, Additional, Error, FiltersAndSortData> => {
	const { parseFiltersAndSort, filtersAndSortData } = params;

	if (parseFiltersAndSort && typeof filtersAndSortData !== "undefined") {
		const parseResult = parseFiltersAndSort(filtersAndSortData);

		if (isPromise(parseResult)) {
			return (parseResult as AsyncParsedFiltersAndSort).then(
				(parsedFiltersAndSort) => ({
					...params,
					...parsedFiltersAndSort,
					loadItems,
				}),
			);
		}

		return {
			...params,
			...(parseResult as UpdateStateParams),
			loadItems,
		};
	}

	return {
		...params,
		loadItems,
	};
};

const initFilterlist = <Item, Additional, Error, FiltersAndSortData>(
	params: Params<Item, Additional, Error, FiltersAndSortData>,
	loadItems: ItemsLoader<Item, Additional, Error>,
):
	| Filterlist<Item, Additional, Error>
	| Promise<Filterlist<Item, Additional, Error>> => {
	const optionsResult = getFilterlistOptions(params, loadItems);

	if (isPromise(optionsResult)) {
		return (
			optionsResult as AsyncParams<Item, Additional, Error, FiltersAndSortData>
		).then((options) => new Filterlist(options));
	}

	return new Filterlist(
		optionsResult as Params<Item, Additional, Error, FiltersAndSortData>,
	);
};

export const useFilterlist = <Item, Additional, Error, FiltersAndSortData>(
	params: Params<Item, Additional, Error, FiltersAndSortData>,
	inputs: readonly unknown[] = [],
): [
	AnySignal<RequestParams | null>,
	AnySignal<ListState<Item, Additional, Error> | null>,
	Filterlist<Item, Additional, Error> | null,
	{
		useBoundFilter: <Value>(filterName: string) => UseFilterReturn<Value>;
	},
] => {
	const {
		parseFiltersAndSort = null,
		filtersAndSortData = null,
		shouldRecount = defaultShouldRecount,
		loadItems,
		canInit = true,
	} = params;

	const loadItemsRef = useLatest(loadItems);

	const loadItemsProxy: ItemsLoader<Item, Additional, Error> = (...args) =>
		loadItemsRef.current(...args);

	const filterlistSignal = useSignalState<Filterlist<
		Item,
		Additional,
		Error
	> | null>(null);

	const isInitInProgress = useSignalState(false);

	const initFilterlistInComponent = (): void => {
		if (!filterlistSignal.get() && !isInitInProgress.get()) {
			const filterlistResult = initFilterlist(params, loadItemsProxy);

			if (isPromise(filterlistResult)) {
				isInitInProgress.set(true);

				(filterlistResult as Promise<Filterlist<Item, Additional, Error>>).then(
					(filterlist) => {
						filterlistSignal.set(filterlist);
						isInitInProgress.set(false);
					},
				);
			} else {
				filterlistSignal.set(
					filterlistResult as Filterlist<Item, Additional, Error>,
				);
			}
		}
	};

	if (canInit) {
		initFilterlistInComponent();
	}

	const requestParams = useSignalComputed(() => {
		const filterlist = filterlistSignal.get();

		if (filterlist) {
			return filterlist.requestParams.get();
		}

		return null;
	});

	const listState = useSignalComputed(() => {
		const filterlist = filterlistSignal.get();

		if (filterlist) {
			return filterlist.listState.get();
		}

		return null;
	});

	const filtersAndSortDataRef = useRef(filtersAndSortData);
	if (
		parseFiltersAndSort &&
		filtersAndSortData &&
		filtersAndSortDataRef.current &&
		shouldRecount(filtersAndSortData, filtersAndSortDataRef.current)
	) {
		(async (): Promise<void> => {
			const parsedFiltersAndSort =
				await parseFiltersAndSort(filtersAndSortData);

			const filterlist = filterlistSignal.get();

			if (filterlist) {
				filterlist.updateStateAndRequest(parsedFiltersAndSort);
			}
		})();
	}
	filtersAndSortDataRef.current = filtersAndSortData;

	// biome-ignore lint/correctness/useExhaustiveDependencies: call only on init
	useEffect(() => {
		if (!canInit) {
			return undefined;
		}

		initFilterlistInComponent();

		return () => {
			const filterlist = filterlistSignal.get();

			if (filterlist) {
				filterlist.destroy();
			}
		};
	}, [...inputs, canInit]);

	const useBoundFilter = useCallback(
		<Value>(filterName: string) =>
			// biome-ignore lint/correctness/useHookAtTopLevel: it's a wrapper to generate the hook
			useFilter<Value, Item, Additional, Error>(
				requestParams,
				listState,
				filterlistSignal.get(),
				filterName,
			),
		[requestParams, listState, filterlistSignal],
	);

	useRerender([requestParams, listState, filterlistSignal]);

	return [
		requestParams,
		listState,
		filterlistSignal.get(),
		{
			useBoundFilter,
		},
	];
};
