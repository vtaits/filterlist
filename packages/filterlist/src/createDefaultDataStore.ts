import type { DataStore, DataStoreListener, RequestParams } from "./types";

export function createDefaultDataStore(initalValue: RequestParams): DataStore {
	let value = initalValue;
	let listeners: DataStoreListener[] = [];

	const setValue = (nextValue: Partial<RequestParams>) => {
		const prevValue = value;

		value = {
			...prevValue,
			...nextValue,
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
