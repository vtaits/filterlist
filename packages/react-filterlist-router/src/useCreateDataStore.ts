import {
	type StringBasedDataStoreOptions,
	createStringBasedDataStore,
} from "@vtaits/filterlist/datastore/string";
import { useSignalify } from "@vtaits/react-signals";
import { useLatest } from "@vtaits/use-latest";
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useCreateDataStore(options?: StringBasedDataStoreOptions) {
	const navigate = useNavigate();
	const { pathname, search } = useLocation();

	const navigateRef = useLatest(navigate);
	const pathnameRef = useLatest(pathname);

	const searchSignal = useSignalify(search);

	const createDataStore = useCallback(
		() =>
			createStringBasedDataStore(
				searchSignal,
				(nextSearch) => {
					navigateRef.current(`${pathnameRef.current}?${nextSearch}`);
				},
				options,
			),
		[searchSignal, navigateRef, options, pathnameRef],
	);

	return createDataStore;
}
