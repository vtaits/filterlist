import type { DataStore, DataStoreListener, RequestParams } from "./types";

export function createDefaultDataStore(initalValue: RequestParams): DataStore {
	let value = initalValue;
	let listeners: DataStoreListener[] = [];

	const setValue = (nextValue: Partial<RequestParams>) => {
		value = {
			...value,
			...nextValue,
		};

		for (const listener of listeners) {
			listener(value);
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
