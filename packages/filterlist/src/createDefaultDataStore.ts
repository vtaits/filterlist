import { Signal } from "signal-polyfill";
import type { DataStore, RequestParams } from "./types";

export function createDefaultDataStore(initalValue: RequestParams): DataStore {
	const signal = new Signal.State(initalValue);

	const setValue = (nextValue: RequestParams) => {
		signal.set(nextValue);
	};

	return {
		signal,
		setValue,
	};
}
