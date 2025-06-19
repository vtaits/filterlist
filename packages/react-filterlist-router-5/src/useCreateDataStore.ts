import type { DataStore } from "@vtaits/filterlist";
import {
	createStringBasedDataStore,
	type StringBasedDataStoreOptions,
} from "@vtaits/filterlist/datastore/string";
import { useSignalify } from "@vtaits/react-signals";
import { useLatest } from "@vtaits/use-latest";
import { useCallback } from "react";
import { useHistory, useLocation } from "react-router-dom";

export function useCreateDataStore(
	options?: StringBasedDataStoreOptions,
): () => DataStore {
	const history = useHistory();
	const { pathname, search } = useLocation();

	const historyRef = useLatest(history);
	const pathnameRef = useLatest(pathname);

	const searchSignal = useSignalify(search);

	const createDataStore = useCallback(
		() =>
			createStringBasedDataStore(
				searchSignal,
				(nextSearch) => {
					historyRef.current.push(`${pathnameRef.current}?${nextSearch}`);
				},
				options,
			),
		[searchSignal, historyRef, options, pathnameRef],
	);

	return createDataStore;
}
