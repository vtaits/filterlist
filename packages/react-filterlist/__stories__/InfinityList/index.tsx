import { useFilterlist } from "@vtaits/react-filterlist";
import qs from "qs";
import { type ReactElement, useCallback, useMemo } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import * as api from "../../../../examples/api";
import type { User } from "../../../../examples/types";
import { Page } from "../../../../examples/ui/Page";

export function InfinityList(): ReactElement | null {
	const navigate = useNavigate();
	const navigationType = useNavigationType();
	const location = useLocation();

	const parsedParams = useMemo(() => {
		const parsed: Record<string, any> = qs.parse(location.search, {
			ignoreQueryPrefix: true,
		});

		const { sort } = parsed;

		const appliedFilters = {
			name: parsed.name || "",
			email: parsed.email || "",
			city: parsed.city || "",
		};

		return {
			sort: {
				param: sort
					? sort[0] === "-"
						? sort.substring(1, sort.length)
						: sort
					: "id",

				asc: !sort || sort[0] !== "-",
			},

			filters: appliedFilters,
			appliedFilters,
			page: parsed.page ? Number(parsed.page) : 1,
			pageSize: (parsed.pageSize && Number(parsed.pageSize)) || 10,
		};
	}, [location.search]);

	const [requestParams, listState, filterlist] = useFilterlist<
		User,
		{
			count: number;
		},
		never
	>(
		{
			loadItems: async (
				{ sort, appliedFilters, pageSize },
				{ loadedPages },
			) => {
				const response = await api.loadUsers({
					...appliedFilters,
					pageSize,
					sort: `${sort.param ? `${sort.asc ? "" : "-"}${sort.param}` : ""}`,
					page: loadedPages + 1,
				});

				return {
					items: response.users,
					total: response.count,
				};
			},

			onChangeLoadParams: () => {
				if (filterlist) {
					const nextRequestParams = filterlist.getRequestParams();

					const newQuery = qs.stringify({
						...nextRequestParams.appliedFilters,
						page: nextRequestParams.page,
						pageSize: nextRequestParams.pageSize,
						sort: nextRequestParams.sort.param
							? `${nextRequestParams.sort.asc ? "" : "-"}${nextRequestParams.sort.param}`
							: null,
					});

					navigate(`${location.pathname}?${newQuery}`);
				}
			},

			...parsedParams,
		},
		[navigationType === "POP" ? location.search : ""],
	);

	const setPage = useCallback(
		(page: number) => {
			if (!filterlist) {
				throw new Error("filterlist is not initialized");
			}

			return filterlist.setPage(page);
		},
		[filterlist],
	);

	const setPageSize = useCallback(
		(pageSize: number | null | undefined) => {
			if (!filterlist) {
				throw new Error("filterlist is not initialized");
			}

			return filterlist.setPageSize(pageSize);
		},
		[filterlist],
	);

	const setFilterValue = useCallback(
		(filterName: string, value: unknown) => {
			if (!filterlist) {
				throw new Error("filterlist is not initialized");
			}

			filterlist.setFilterValue(filterName, value);
		},
		[filterlist],
	);

	const setSorting = useCallback(
		(paramName: string, asc?: boolean) => {
			if (!filterlist) {
				throw new Error("filterlist is not initialized");
			}

			return filterlist.setSorting(paramName, asc);
		},
		[filterlist],
	);

	const resetAllFilters = useCallback(() => {
		if (!filterlist) {
			throw new Error("filterlist is not initialized");
		}

		return filterlist.resetAllFilters();
	}, [filterlist]);

	const reload = useCallback(() => {
		if (!filterlist) {
			throw new Error("filterlist is not initialized");
		}

		return filterlist.reload();
	}, [filterlist]);

	const resetFilter = useCallback(
		(filterName: string) => {
			if (!filterlist) {
				throw new Error("filterlist is not initialized");
			}

			return filterlist.resetFilter(filterName);
		},
		[filterlist],
	);

	const applyFilter = useCallback(
		(filterName: string) => {
			if (!filterlist) {
				throw new Error("filterlist is not initialized");
			}

			return filterlist.applyFilter(filterName);
		},
		[filterlist],
	);

	const setAndApplyFilter = useCallback(
		(filterName: string, value: unknown) => {
			if (!filterlist) {
				throw new Error("filterlist is not initialized");
			}

			return filterlist.setAndApplyFilter(filterName, value);
		},
		[filterlist],
	);

	const loadMore = useCallback(() => {
		if (!filterlist) {
			throw new Error("filterlist is not initialized");
		}

		filterlist.loadMore();
	}, [filterlist]);

	if (!listState || !requestParams) {
		return null;
	}

	const { page, pageSize, sort } = requestParams;

	const { items, loading, total, filters } = listState;

	return (
		<Page
			requestParams={requestParams}
			listState={listState}
			filters={filters}
			page={page}
			pageSize={pageSize}
			sort={sort}
			items={items}
			loading={loading}
			setFilterValue={setFilterValue}
			resetFilter={resetFilter}
			applyFilter={applyFilter}
			resetAllFilters={resetAllFilters}
			reload={reload}
			setAndApplyFilter={setAndApplyFilter}
			setPage={setPage}
			setPageSize={setPageSize}
			setSorting={setSorting}
			total={total}
			isInfinity
			loadMore={loadMore}
		/>
	);
}
