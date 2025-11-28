import mitt from "mitt";
import qs from "qs";
import type { DataStore, RequestParams, Sort } from "../types";

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
	excludeFiltersFromDataStore?: Set<string>;
	initialPageSize?: number;
	initialSort?: Sort;
	pageKey?: string;
	pageSizeKey?: string;
	sortKey?: string;
	parseOptions?: qs.IParseOptions<qs.BooleanOptional>;
	stringifyOptions?: qs.IStringifyOptions<qs.BooleanOptional>;
}>;

function getFirst(arg: unknown) {
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
		excludeFiltersFromDataStore,
		initialPageSize,
		initialSort,
		pageKey = "page",
		pageSizeKey = "page_size",
		sortKey = "sort",
		parseOptions,
		stringifyOptions,
	} = options;

	function getStateFromSearch(search: string): RequestParams {
		const parsed = qs.parse(search, {
			ignoreQueryPrefix: true,
			allowEmptyArrays: true,
			...parseOptions,
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
			sort: sort
				? {
						param: sort
							? sort[0] === "-"
								? sort.substring(1, sort.length)
								: sort
							: undefined,
						asc: !sort || sort[0] !== "-",
					}
				: (initialSort ?? {
						param: undefined,
						asc: true,
					}),
			appliedFilters: excludeFiltersFromDataStore ? Object.fromEntries(
				Object.entries(appliedFilters).filter(
					([filterName]) => !excludeFiltersFromDataStore.has(filterName),
				),
			) : appliedFilters,
			page: page ? Number(page) : 1,
			pageSize: (pageSize && Number(pageSize)) || initialPageSize,
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

	let prevValue = getStateFromSearch(getSearch());

	return {
		getValue: () => {
			const search = getSearch();

			if (cacheKey !== search) {
				prevValue = cacheValue;
				cacheKey = search;
				cacheValue = getStateFromSearch(search);
			}

			return cacheValue;
		},
		setValue: (nextRequestParams) => {
			const appliedFilters = excludeFiltersFromDataStore ? Object.fromEntries(
				Object.entries(nextRequestParams.appliedFilters ?? {}).filter(
					([filterName]) => !excludeFiltersFromDataStore.has(filterName),
				),
			): nextRequestParams.appliedFilters;

			const newQuery = qs.stringify(
				{
					...appliedFilters,
					[pageKey]:
						nextRequestParams.page === 1 ? undefined : nextRequestParams.page,
					[pageSizeKey]: nextRequestParams.pageSize,
					[sortKey]: nextRequestParams.sort?.param
						? `${nextRequestParams.sort.asc ? "" : "-"}${nextRequestParams.sort.param}`
						: undefined,
				},
				{
					allowEmptyArrays: true,
					...stringifyOptions,
				},
			);

			setSearch(`${newQuery}`);
		},

		subscribe: (callback) => {
			const listenCallback = () => {
				const search = getSearch();

				if (cacheKey !== search) {
					prevValue = cacheValue;
					cacheKey = search;
					cacheValue = getStateFromSearch(search);
				}

				callback(cacheValue, prevValue);
			};

			emitter.on(listenCallback);

			return () => {
				emitter.off(listenCallback);
			};
		},
	};
}
