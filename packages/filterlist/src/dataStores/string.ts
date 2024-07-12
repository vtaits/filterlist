import mitt from "mitt";
import qs from "qs";
import type { DataStore, RequestParams } from "../types";

const EVENT_TYPE = "UPDATE_SEARCH";

type EmitterWrapper = Readonly<{
	emit: VoidFunction;
	on: (callback: VoidFunction) => void;
	off: (callback: VoidFunction) => void;
}>;

export function createEmitter() {
	const emitter = mitt();

	return {
		emit: () => {
			emitter.emit(EVENT_TYPE);
		},
		on: (callback: VoidFunction) => {
			emitter.on(EVENT_TYPE, callback);
		},
		off: (callback: VoidFunction) => {
			emitter.off(EVENT_TYPE, callback);
		},
	};
}

export type StringBasedDataStoreOptions = Readonly<{
	pageKey?: string;
	pageSizeKey?: string;
	sortKey?: string;
}>;

function getFirst(arg: qs.ParsedQs[string]) {
	if (typeof arg === "string") {
		return arg;
	}

	if (!arg) {
		return undefined;
	}

	if (Array.isArray(arg)) {
		return getFirst(arg[0]);
	}

	return undefined;
}

export function createStringBasedDataStore(
	getSearch: () => string,
	setSearch: (nextValue: string) => void,
	emitter: EmitterWrapper,
	options: StringBasedDataStoreOptions = {},
): DataStore {
	const {
		pageKey = "page",
		pageSizeKey = "page_size",
		sortKey = "sort",
	} = options;

	function getStateFromSearch(search: string): RequestParams {
		const parsed = qs.parse(search, {
			ignoreQueryPrefix: true,
		});

		const {
			[pageKey]: pageValue,
			[pageSizeKey]: pageSizeValue,
			[sortKey]: sortValue,
			...appliedFilters
		} = parsed;

		const page = getFirst(pageValue);
		const pageSize = getFirst(pageSizeValue);
		const sort = getFirst(sortValue);

		return {
			sort: {
				param: sort
					? sort[0] === "-"
						? sort.substring(1, sort.length)
						: sort
					: undefined,
				asc: !sort || sort[0] === "-",
			},
			appliedFilters,
			page: page ? Number(page) : 1,
			pageSize: pageSize ? Number(pageSize) : undefined,
		};
	}

	let cacheKey: string | null = null;
	let cacheValue: RequestParams = {
		appliedFilters: {},
		page: 1,
		sort: {
			asc: false,
		},
	};

	return {
		getValue: () => {
			const search = getSearch();

			if (cacheKey !== search) {
				cacheKey = search;
				cacheValue = getStateFromSearch(search);
			}

			return cacheValue;
		},
		setValue: (nextRequestParams) => {
			const newQuery = qs.stringify({
				...nextRequestParams.appliedFilters,
				[pageKey]: nextRequestParams.page,
				[pageSizeKey]: nextRequestParams.pageSize,
				[sortKey]: nextRequestParams.sort?.param
					? `${nextRequestParams.sort.asc ? "" : "-"}${nextRequestParams.sort.param}`
					: null,
			});

			setSearch(`${newQuery}`);
		},

		subscribe: (callback) => {
			const listenCallback = () => {
				const search = getSearch();

				if (cacheKey !== search) {
					cacheKey = search;
					cacheValue = getStateFromSearch(search);
				}

				callback(cacheValue);
			};

			emitter.on(listenCallback);

			return () => {
				emitter.off(listenCallback);
			};
		},
	};
}
