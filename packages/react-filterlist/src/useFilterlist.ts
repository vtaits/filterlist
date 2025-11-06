/**
 * TO DO: add tests
 */

import type { ItemsLoader, ListState, RequestParams } from "@vtaits/filterlist";
import { EventType, Filterlist } from "@vtaits/filterlist";
import { useLatest } from "@vtaits/use-latest";
import { useCallback, useEffect, useRef, useState } from "react";
import type { OnChangeLoadParams, Params, UseFilterReturn } from "./types";
import { useFilter } from "./useFilter";

type SyncListState = () => void;

const initFilterlist = <Item, Additional, Error>(
	params: Params<Item, Additional, Error>,
	loadItems: ItemsLoader<Item, Additional, Error>,
	syncListState: SyncListState,
	onChangeLoadParams: OnChangeLoadParams<Item, Additional, Error>,
) => {
	const filterlist = new Filterlist<Item, Additional, Error>({
		...params,
		loadItems,
	});

	filterlist.emitter.on(EventType.changeListState, syncListState);
	filterlist.emitter.on(EventType.changeRequestParams, onChangeLoadParams);

	return filterlist;
};

export const useFilterlist = <Item, Additional, Error>(
	params: Params<Item, Additional, Error>,
	inputs: readonly unknown[] = [],
): [
	RequestParams | null,
	ListState<Item, Additional, Error> | null,
	Filterlist<Item, Additional, Error> | null,
	{
		useBoundFilter: <Value>(filterName: string) => UseFilterReturn<Value>;
	},
] => {
	const { onChangeLoadParams = null, loadItems, canInit = true } = params;

	const loadItemsRef = useLatest(loadItems);

	const loadItemsProxy: ItemsLoader<Item, Additional, Error> = (...args) =>
		loadItemsRef.current(...args);

	const onChangeLoadParamsRef = useLatest(onChangeLoadParams);

	const onChangeLoadParamsProxy = useCallback(
		(nextListState: ListState<Item, Additional, Error>) => {
			if (onChangeLoadParamsRef.current) {
				onChangeLoadParamsRef.current(nextListState);
			}
		},
		[onChangeLoadParamsRef],
	);

	const filterlistRef = useRef<Filterlist<Item, Additional, Error>>(null);

	const setListStateRef =
		useRef<
			(
				nextListState: [
					RequestParams | null,
					ListState<Item, Additional, Error> | null,
				],
			) => void
		>(null);

	const syncListState = (): void => {
		setListStateRef.current?.([
			filterlistRef.current ? filterlistRef.current.getRequestParams() : null,
			filterlistRef.current ? filterlistRef.current.getListState() : null,
		]);
	};

	const initFilterlistInComponent = (): void => {
		if (!filterlistRef.current) {
			const filterlistResult = initFilterlist(
				params,
				loadItemsProxy,
				syncListState,
				onChangeLoadParamsProxy,
			);

			filterlistRef.current = filterlistResult as Filterlist<
				Item,
				Additional,
				Error
			>;
		}
	};

	if (canInit) {
		initFilterlistInComponent();
	}

	const [[requestParams, listState], setListStateHandler] = useState<
		[RequestParams | null, ListState<Item, Additional, Error> | null]
	>([
		filterlistRef.current ? filterlistRef.current.getRequestParams() : null,
		filterlistRef.current ? filterlistRef.current.getListState() : null,
	]);
	setListStateRef.current = setListStateHandler;

	// biome-ignore lint/correctness/useExhaustiveDependencies: call only on init
	useEffect(() => {
		if (!canInit) {
			return undefined;
		}

		initFilterlistInComponent();

		syncListState();

		return () => {
			if (filterlistRef.current) {
				filterlistRef.current.emitter.off(EventType.changeListState);
				filterlistRef.current.emitter.off(EventType.changeLoadParams);

				// Support older versions
				filterlistRef.current?.destroy();
			}

			filterlistRef.current = null;
		};
	}, [...inputs, canInit]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: bug
	const useBoundFilter = useCallback(
		<Value>(filterName: string) =>
			// biome-ignore lint/correctness/useHookAtTopLevel: it's a wrapper to generate the hook
			useFilter<Value, Item, Additional, Error>(
				requestParams,
				listState,
				filterlistRef.current || null,
				filterName,
			),
		[requestParams, listState],
	);

	return [
		requestParams,
		listState,
		filterlistRef.current || null,
		{
			useBoundFilter,
		},
	];
};
