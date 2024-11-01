import type { Filterlist, ListState, RequestParams } from "@vtaits/filterlist";
import {
	type AnySignal,
	useSignalComputed,
	useSignalify,
} from "@vtaits/react-signals";
import { useCallback } from "react";
import type { UseFilterReturn } from "./types";

export function useFilter<Value, Item, Additional, Error>(
	requestParamsSignal: AnySignal<RequestParams | null>,
	listStateSignal: AnySignal<ListState<Item, Additional, Error> | null>,
	filterlist: Filterlist<Item, Additional, Error> | null,
	name: string,
): UseFilterReturn<Value> {
	const nameSignal = useSignalify(name);

	const setFilterValue = useCallback(
		(value: Value) => {
			if (!filterlist) {
				return;
			}

			filterlist.setFilterValue(nameSignal.get(), value);
		},
		[filterlist, nameSignal],
	);

	const setAndApplyFilter = useCallback(
		(value: Value) => {
			if (!filterlist) {
				return;
			}

			filterlist.setAndApplyFilter(nameSignal.get(), value);
		},
		[filterlist, nameSignal],
	);

	const applyFilter = useCallback(() => {
		if (!filterlist) {
			return;
		}

		filterlist.applyFilter(nameSignal.get());
	}, [filterlist, nameSignal]);

	const resetFilter = useCallback(() => {
		if (!filterlist) {
			return;
		}

		filterlist.resetFilter(nameSignal.get());
	}, [filterlist, nameSignal]);

	const valueSignal = useSignalComputed(() => {
		const listState = listStateSignal.get();

		if (!listState) {
			return null;
		}

		return listState.filters[nameSignal.get()] as Value;
	});

	const appliedValueSignal = useSignalComputed(() => {
		const requestParams = requestParamsSignal.get();

		if (!requestParams) {
			return null;
		}

		return requestParams.appliedFilters[nameSignal.get()] as Value;
	});

	return {
		setFilterValue,
		setAndApplyFilter,
		applyFilter,
		resetFilter,
		valueSignal,
		appliedValueSignal,
	};
}
