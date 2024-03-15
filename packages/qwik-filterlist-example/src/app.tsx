/** @jsxImportSource @builder.io/qwik */
import { $, component$ } from "@builder.io/qwik";
import { useFilterlist } from "@vtaits/qwik-filterlist";
import * as api from "../../../examples/api";
import type { User } from "../../../examples/types";
import { Page } from "./ui/Page";

export const App = component$(() => {
	const [listState, filterlist] = useFilterlist<
		User,
		{
			count: number;
		},
		never,
		never
	>({
		loadItems$: $(async ({ sort, appliedFilters, page, pageSize }) => {
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
		}),
	});

	if (!listState.value) {
		return null;
	}

	return (
		<Page
			listState={listState.value}
			setFilterValue$={(filterName, value) => {
				if (!filterlist) {
					throw new Error("filterlist is not initialized");
				}

				return filterlist.setFilterValue(filterName, value);
			}}
			resetFilter$={(filterName) => {
				if (!filterlist) {
					throw new Error("filterlist is not initialized");
				}

				return filterlist.resetFilter(filterName);
			}}
			applyFilter$={(filterName) => {
				if (!filterlist) {
					throw new Error("filterlist is not initialized");
				}

				return filterlist.applyFilter(filterName);
			}}
			resetAllFilters$={() => {
				if (!filterlist) {
					throw new Error("filterlist is not initialized");
				}

				return filterlist.resetAllFilters();
			}}
			reload$={() => {
				if (!filterlist) {
					throw new Error("filterlist is not initialized");
				}

				return filterlist.reload();
			}}
			setPage$={(page) => {
				if (!filterlist) {
					throw new Error("filterlist is not initialized");
				}

				return filterlist.setPage(page);
			}}
			setPageSize$={(pageSize) => {
				if (!filterlist) {
					throw new Error("filterlist is not initialized");
				}

				return filterlist.setPageSize(pageSize);
			}}
			setSorting$={(paramName, asc) => {
				if (!filterlist) {
					throw new Error("filterlist is not initialized");
				}

				return filterlist.setSorting(paramName, asc);
			}}
		/>
	);
});
