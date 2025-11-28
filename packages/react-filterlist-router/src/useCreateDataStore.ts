import type { CreateDataStoreParams, DataStore } from "@vtaits/filterlist";
import {
	createEmitter,
	createStringBasedDataStore,
	type StringBasedDataStoreOptions,
} from "@vtaits/filterlist/datastore/string";
import { useLatest } from "@vtaits/use-latest";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useCreateDataStore(
	_options?: StringBasedDataStoreOptions,
): (params: CreateDataStoreParams) => DataStore {
	const navigate = useNavigate();
	const { pathname, search } = useLocation();

	const [emitter] = useState(() => createEmitter());

	const navigateRef = useLatest(navigate);
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
					navigateRef.current(`${pathnameRef.current}?${nextSearch}`);
				},
				emitter,
				{
					...initialRequestParams,
					excludeFiltersFromDataStore,
					initialPageSize: initialRequestParams.pageSize ?? undefined,
					initialSort: initialRequestParams.sort,
				},
			),
		[emitter, navigateRef, pathnameRef, searchRef],
	);

	return createDataStore;
}
