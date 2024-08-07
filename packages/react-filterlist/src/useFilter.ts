import type { Filterlist, ListState, RequestParams } from "@vtaits/filterlist";
import { useCallback, useMemo } from "react";
import type { UseFilterReturn } from "./types";

export function useFilter<Value, Item, Additional, Error>(
	requestParams: RequestParams | null,
	listState: ListState<Item, Additional, Error> | null,
	filterlist: Filterlist<Item, Additional, Error> | null,
	name: string,
): UseFilterReturn<Value> {
	const setFilterValue = useCallback(
		(value: Value) => {
			if (!filterlist) {
				return;
			}

			filterlist.setFilterValue(name, value);
		},
		[filterlist, name],
	);

	const setAndApplyFilter = useCallback(
		(value: Value) => {
			if (!filterlist) {
				return;
			}

			filterlist.setAndApplyFilter(name, value);
		},
		[filterlist, name],
	);

	const applyFilter = useCallback(() => {
		if (!filterlist) {
			return;
		}

		filterlist.applyFilter(name);
	}, [filterlist, name]);

	const resetFilter = useCallback(() => {
		if (!filterlist) {
			return;
		}

		filterlist.resetFilter(name);
	}, [filterlist, name]);

	const value = useMemo(() => {
		if (!listState) {
			return null;
		}

		return listState.filters[name] as Value;
	}, [listState, name]);

	const appliedValue = useMemo(() => {
		if (!requestParams) {
			return null;
		}

		return requestParams.appliedFilters[name] as Value;
	}, [requestParams, name]);

	return {
		setFilterValue,
		setAndApplyFilter,
		applyFilter,
		resetFilter,
		value,
		appliedValue,
	};
}
