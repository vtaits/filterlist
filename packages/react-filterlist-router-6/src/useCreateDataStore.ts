import {
	type StringBasedDataStoreOptions,
	createEmitter,
	createStringBasedDataStore,
} from "@vtaits/filterlist/datastore/string";
import { useLatest } from "@vtaits/use-latest";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useCreateDataStore(options?: StringBasedDataStoreOptions) {
	const navigate = useNavigate();
	const { pathname, search } = useLocation();

	const [emitter] = useState(() => createEmitter());

	const navigateRef = useLatest(navigate);
	const pathnameRef = useLatest(pathname);
	const searchRef = useLatest(search);

	// biome-ignore lint/correctness/useExhaustiveDependencies: trigger on search change
	useEffect(() => {
		emitter.emit();
	}, [search]);

	const createDataStore = useCallback(
		() =>
			createStringBasedDataStore(
				() => searchRef.current,
				(nextSearch) => {
					navigateRef.current(`${pathnameRef.current}?${nextSearch}`);
				},
				emitter,
				options,
			),
		[emitter, navigateRef, options, pathnameRef, searchRef],
	);

	return createDataStore;
}
