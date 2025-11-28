import type {
	CreateDataStoreParams,
	DataStore,
	DataStoreListener,
	RequestParams,
} from "./types";

export function createDefaultDataStore({
	initialRequestParams,
	excludeFiltersFromDataStore,
}: CreateDataStoreParams): DataStore {
	let value = {
		...initialRequestParams,
		appliedFilters: Object.fromEntries(
			Object.entries(initialRequestParams.appliedFilters).filter(
				([filterName]) => !excludeFiltersFromDataStore.has(filterName),
			),
		),
	};

	let listeners: DataStoreListener[] = [];

	const setValue = (nextValue: Partial<RequestParams>) => {
		const prevValue = value;

		const appliedFilters = Object.fromEntries(
			Object.entries(nextValue.appliedFilters ?? {}).filter(
				([filterName]) => !excludeFiltersFromDataStore.has(filterName),
			),
		);

		value = {
			...prevValue,
			...nextValue,
			appliedFilters,
		};

		for (const listener of listeners) {
			listener(value, prevValue);
		}
	};

	return {
		getValue: () => value,
		setValue: setValue,
		subscribe: (listener) => {
			listeners.push(listener);

			return () => {
				listeners = listeners.filter((item) => item !== listener);
			};
		},
	};
}
