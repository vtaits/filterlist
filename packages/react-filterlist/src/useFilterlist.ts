/**
 * TO DO: add tests
 */

import { Filterlist, eventTypes } from "@vtaits/filterlist";
import type {
	ItemsLoader,
	ListState,
	UpdateStateParams,
} from "@vtaits/filterlist";
import isPromise from "is-promise";
import { useCallback, useEffect, useRef, useState } from "react";
import useLatest from "use-latest";
import { defaultShouldRecount } from "./defaultShouldRecount";
import type {
	AsyncParams,
	AsyncParsedFiltersAndSort,
	OnChangeLoadParams,
	Params,
	UseFilterReturn,
} from "./types";
import { useFilter } from "./useFilter";

type SyncListState = () => void;

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

const createFilterlist = <Item, Additional, Error, FiltersAndSortData>(
	options: Params<Item, Additional, Error, FiltersAndSortData>,
	syncListState: SyncListState,
	onChangeLoadParams: OnChangeLoadParams<Item, Additional, Error>,
): Filterlist<Item, Additional, Error> => {
	const filterlist = new Filterlist<Item, Additional, Error>(options);

	filterlist.emitter.on(eventTypes.changeListState, syncListState);
	filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

	return filterlist;
};

const initFilterlist = <Item, Additional, Error, FiltersAndSortData>(
	params: Params<Item, Additional, Error, FiltersAndSortData>,
	loadItems: ItemsLoader<Item, Additional, Error>,
	syncListState: SyncListState,
	onChangeLoadParams: OnChangeLoadParams<Item, Additional, Error>,
):
	| Filterlist<Item, Additional, Error>
	| Promise<Filterlist<Item, Additional, Error>> => {
	const optionsResult = getFilterlistOptions(params, loadItems);

	if (isPromise(optionsResult)) {
		return (
			optionsResult as AsyncParams<Item, Additional, Error, FiltersAndSortData>
		).then((options) =>
			createFilterlist(options, syncListState, onChangeLoadParams),
		);
	}

	return createFilterlist(
		optionsResult as Params<Item, Additional, Error, FiltersAndSortData>,
		syncListState,
		onChangeLoadParams,
	);
};

export const useFilterlist = <Item, Additional, Error, FiltersAndSortData>(
	params: Params<Item, Additional, Error, FiltersAndSortData>,
	inputs: readonly unknown[] = [],
): [
	ListState<Item, Additional, Error> | null,
	Filterlist<Item, Additional, Error> | null,
	{
		useBoundFilter: <Value>(filterName: string) => UseFilterReturn<Value>;
	},
] => {
	const {
		parseFiltersAndSort = null,
		filtersAndSortData = null,
		shouldRecount = defaultShouldRecount,
		onChangeLoadParams = null,
		loadItems,
		canInit = true,
	} = params;

	const loadItemsRef = useLatest(loadItems);

	const loadItemsProxy: ItemsLoader<Item, Additional, Error> = (
		nextListState,
	) => loadItemsRef.current(nextListState);

	const onChangeLoadParamsRef = useLatest(onChangeLoadParams);

	const onChangeLoadParamsProxy = useCallback(
		(nextListState: ListState<Item, Additional, Error>) => {
			if (onChangeLoadParamsRef.current) {
				onChangeLoadParamsRef.current(nextListState);
			}
		},
		[onChangeLoadParamsRef],
	);

	const isInitInProgressRef = useRef(false);
	const filterlistRef = useRef<Filterlist<Item, Additional, Error>>();

	const setListStateRef =
		useRef<
			(nextListState: ListState<Item, Additional, Error> | null) => void
		>();

	const syncListState = (): void => {
		setListStateRef.current?.(
			filterlistRef.current ? filterlistRef.current.getListState() : null,
		);
	};

	const initFilterlistInComponent = (isInEffect: boolean): void => {
		if (!filterlistRef.current && !isInitInProgressRef.current) {
			const filterlistResult = initFilterlist(
				params,
				loadItemsProxy,
				syncListState,
				onChangeLoadParamsProxy,
			);

			if (isPromise(filterlistResult)) {
				isInitInProgressRef.current = true;

				(filterlistResult as Promise<Filterlist<Item, Additional, Error>>).then(
					(filterlist) => {
						filterlistRef.current = filterlist;
						isInitInProgressRef.current = false;

						setListStateRef.current?.(filterlist.getListState());
					},
				);
			} else {
				filterlistRef.current = filterlistResult as Filterlist<
					Item,
					Additional,
					Error
				>;
			}
		}

		if (isInEffect) {
			syncListState();
		}
	};

	if (canInit) {
		initFilterlistInComponent(false);
	}

	const [listState, setListStateHandler] = useState<ListState<
		Item,
		Additional,
		Error
	> | null>(
		filterlistRef.current ? filterlistRef.current.getListState() : null,
	);
	setListStateRef.current = setListStateHandler;

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

			const filterlist = filterlistRef.current;

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

		initFilterlistInComponent(true);

		return () => {
			if (filterlistRef.current) {
				filterlistRef.current.emitter.off(eventTypes.changeListState);
				filterlistRef.current.emitter.off(eventTypes.changeLoadParams);

				// Support older versions
				filterlistRef.current?.destroy();
			}

			filterlistRef.current = undefined;
			isInitInProgressRef.current = false;
		};
	}, [...inputs, canInit]);

	const useBoundFilter = useCallback(
		<Value>(filterName: string) =>
			useFilter<Value, Item, Additional, Error>(
				listState,
				filterlistRef.current || null,
				filterName,
			),
		[listState],
	);

	return [
		listState,
		filterlistRef.current || null,
		{
			useBoundFilter,
		},
	];
};
