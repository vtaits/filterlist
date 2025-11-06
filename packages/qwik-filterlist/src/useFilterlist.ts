/**
 * TO DO: add tests
 */

import {
	type NoSerialize,
	noSerialize,
	type QRL,
	type Signal,
	type Tracker,
	useSignal,
	useTask$,
} from "@builder.io/qwik";
import type { ItemsLoader, ListState, RequestParams } from "@vtaits/filterlist";
import { EventType, Filterlist } from "@vtaits/filterlist";
import type { OnChangeLoadParams, Params } from "./types";

type SyncListState = () => void;

const initFilterlist = <Item, Additional, Error>(
	params: Params<Item, Additional, Error>,
	loadItems$: QRL<ItemsLoader<Item, Additional, Error>>,
	syncListState: SyncListState,
	onChangeLoadParams$: QRL<OnChangeLoadParams<Item, Additional, Error>> | null,
) => {
	const filterlist = new Filterlist<Item, Additional, Error>({
		...params,
		loadItems: loadItems$,
	});

	filterlist.emitter.on(EventType.changeListState, syncListState);

	if (onChangeLoadParams$) {
		filterlist.emitter.on(EventType.changeLoadParams, onChangeLoadParams$);
	}

	return filterlist;
};

export const useFilterlist = <Item, Additional, Error>(
	params: Params<Item, Additional, Error>,
	trackInputs?: (params: { track: Tracker }) => void,
): [
	Signal<RequestParams | null>,
	Signal<ListState<Item, Additional, Error> | null>,
	Filterlist<Item, Additional, Error> | null,
] => {
	const { onChangeLoadParams$ = null, loadItems$, canInit = true } = params;

	const isInitInProgressRef = useSignal(false);

	const filterlistRef =
		useSignal<NoSerialize<Filterlist<Item, Additional, Error>>>();

	const syncListState = (): void => {
		requestParams.value = filterlistRef.value
			? filterlistRef.value.getRequestParams()
			: null;

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

			filterlistRef.value = noSerialize(
				filterlistResult as Filterlist<Item, Additional, Error>,
			);
		}

		if (isInEffect) {
			syncListState();
		}
	});

	if (canInit) {
		initFilterlistInComponent?.(false);
	}

	const requestParams = useSignal<RequestParams | null>(
		filterlistRef.value ? filterlistRef.value.getRequestParams() : null,
	);

	const listState = useSignal<ListState<Item, Additional, Error> | null>(
		filterlistRef.value ? filterlistRef.value.getListState() : null,
	);

	useTask$(({ track }) => {
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
				filterlistRef.value.emitter.off(EventType.changeListState);
				filterlistRef.value.emitter.off(EventType.changeLoadParams);
			}

			filterlistRef.value = undefined;
			isInitInProgressRef.value = false;
		};
	});

	return [requestParams, listState, filterlistRef.value || null];
};
