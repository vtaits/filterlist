import qs from "qs";
import { Signal } from "signal-polyfill";
import type { DataStore, RequestParams } from "../types";

export type StringBasedDataStoreOptions = Readonly<{
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
	searchSignal: Signal.State<string> | Signal.Computed<string>,
	setSearch: (nextValue: string) => void,
	options: StringBasedDataStoreOptions = {},
): DataStore {
	const {
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
			sort: {
				param: sort
					? sort[0] === "-"
						? sort.substring(1, sort.length)
						: sort
					: undefined,
				asc: !sort || sort[0] !== "-",
			},
			appliedFilters,
			page: page ? Number(page) : 1,
			pageSize: pageSize ? Number(pageSize) : undefined,
		};
	}

	const signal = new Signal.Computed(() =>
		getStateFromSearch(searchSignal.get()),
	);

	return {
		signal,
		setValue: (nextRequestParams) => {
			const newQuery = qs.stringify(
				{
					...nextRequestParams.appliedFilters,
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

			setSearch(newQuery);
		},
	};
}
