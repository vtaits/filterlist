import { useFilterlist } from "@vtaits/react-filterlist";
import { useCreateDataStore } from "@vtaits/react-filterlist-router";
import { type ReactElement, useCallback, useEffect, useState } from "react";
import * as api from "../../../../examples/api";
import type { User } from "../../../../examples/types";
import { Page } from "../../../../examples/ui/Page";

export function DeferredInit(): ReactElement | null {
	const [canInit, setCanInit] = useState(false);

	useEffect((): void => {
		setTimeout((): void => {
			setCanInit(true);
		}, 2000);
	}, []);

	const createDataStore = useCreateDataStore();

	const [requestParams, listState, filterlist] = useFilterlist<
		User,
		{
			count: number;
		},
		never
	>({
		canInit,

		createDataStore,

		loadItems: async ({ sort, appliedFilters, page, pageSize }) => {
			const response = await api.loadUsers({
				...appliedFilters,
				page,
				pageSize,
				sort: `${sort.param ? `${sort.asc ? "" : "-"}${sort.param}` : ""}`,
			});

			return {
				items: response.users,
				total: response.count,
			};
		},
	});

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
		(filterName: string, value: unknown): void => {
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
			total={total}
			setAndApplyFilter={setAndApplyFilter}
			setPage={setPage}
			setPageSize={setPageSize}
			setSorting={setSorting}
		/>
	);
}
