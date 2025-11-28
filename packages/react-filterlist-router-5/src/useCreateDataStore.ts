import type { CreateDataStoreParams, DataStore } from "@vtaits/filterlist";
import {
	createEmitter,
	createStringBasedDataStore,
	type StringBasedDataStoreOptions,
} from "@vtaits/filterlist/datastore/string";
import { useLatest } from "@vtaits/use-latest";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

export function useCreateDataStore(
	_options?: StringBasedDataStoreOptions,
): (params: CreateDataStoreParams) => DataStore {
	const history = useHistory();
	const { pathname, search } = useLocation();

	const [emitter] = useState(() => createEmitter());

	const historyRef = useLatest(history);
	const pathnameRef = useLatest(pathname);
	const searchRef = useLatest(search);

	const isInitRef = useRef(true);

	// biome-ignore lint/correctness/useExhaustiveDependencies: trigger on search change
	useEffect(() => {
		if (isInitRef.current) {
			isInitRef.current = false;
			return;
		}

		emitter.emit();
	}, [search]);

	const createDataStore = useCallback(
		({
			excludeFiltersFromDataStore,
			initialRequestParams,
		}: CreateDataStoreParams) =>
			createStringBasedDataStore(
				() => searchRef.current,
				(nextSearch) => {
					historyRef.current.push(`${pathnameRef.current}?${nextSearch}`);
				},
				emitter,
				{
					...initialRequestParams,
					excludeFiltersFromDataStore,
					initialPageSize: initialRequestParams.pageSize ?? undefined,
					initialSort: initialRequestParams.sort,
				},
			),
		[emitter, historyRef, pathnameRef, searchRef],
	);

	return createDataStore;
}
