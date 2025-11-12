import { describe, expect, mock, test } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import type { StringBasedDataStoreOptions } from "@vtaits/filterlist/datastore/string";
import { type Params, useFilterlist } from "@vtaits/react-filterlist";
import { createRef, type PropsWithChildren } from "react";
import { MemoryRouter, Route } from "react-router-dom";
import { useCreateDataStore } from "./useCreateDataStore";

function useCompositeHook(
	params: Params<unknown, unknown, unknown>,
	options: StringBasedDataStoreOptions = {},
) {
	const createDataStore = useCreateDataStore(options);

	return useFilterlist({
		...params,
		createDataStore,
	});
}

function setup(
	params: Params<unknown, unknown, unknown>,
	href: string,
	options: StringBasedDataStoreOptions = {},
) {
	const locationRef = createRef<{
		search: string;
		pathname: string;
	}>();
	const historyRef = createRef<{
		goBack: VoidFunction;
	}>();

	const wrapper = ({ children }: PropsWithChildren) => (
		<MemoryRouter initialEntries={[href]}>
			{children}

			<Route
				path="/page"
				render={({ history, location }) => {
					historyRef.current = history;
					locationRef.current = location;

					return null;
				}}
			/>
		</MemoryRouter>
	);

	const { result } = renderHook(() => useCompositeHook(params, options), {
		wrapper,
	});

	return {
		result,
		historyRef,
		locationRef,
	};
}

test.each([
	{
		params: {},
		href: "/page",
		appliedFilters: {},
		page: 1,
		pageSize: undefined,
		sort: {
			param: null,
			asc: true,
		},
		options: undefined,
	},
	{
		params: {},
		href: "/page?page=3&page_size=20&sort=-id&foo=bar&baz=qux",
		appliedFilters: {
			foo: "bar",
			baz: "qux",
		},
		page: 3,
		pageSize: 20,
		sort: {
			param: "id",
			asc: false,
		},
		options: undefined,
	},
	{
		params: {},
		href: "/page?page=3&page_size=20&sort=id&foo=bar&baz=qux",
		appliedFilters: {
			foo: "bar",
			baz: "qux",
		},
		page: 3,
		pageSize: 20,
		sort: {
			param: "id",
			asc: true,
		},
		options: undefined,
	},
	{
		params: {
			sort: {
				param: "id",
				asc: true,
			},
		},
		href: "/page",
		appliedFilters: {},
		page: 1,
		pageSize: undefined,
		sort: {
			param: "id",
			asc: true,
		},
		options: undefined,
	},
	{
		params: {},
		href: "/page?test_page=3&test_page_size=20&test_sort=id&foo=bar&baz=qux",
		appliedFilters: {
			foo: "bar",
			baz: "qux",
		},
		page: 3,
		pageSize: 20,
		sort: {
			param: "id",
			asc: true,
		},
		options: {
			pageKey: "test_page",
			pageSizeKey: "test_page_size",
			sortKey: "test_sort",
		},
	},
])(
	"should parse query correctly: $href",
	({ href, appliedFilters, page, pageSize, sort, params, options }) => {
		const loadItems = mock().mockResolvedValue({
			items: [],
		});

		const { result } = setup(
			{
				...params,
				loadItems,
			},
			href,
			options,
		);

		expect(loadItems).toHaveBeenCalledTimes(1);

		expect(result.current[2]?.getRequestParams()).toEqual({
			appliedFilters,
			page,
			pageSize,
			sort,
		});
	},
);

describe("should change query", () => {
	test("only filters", async () => {
		const loadItems = mock().mockResolvedValue({
			items: [],
		});

		const { result, locationRef } = setup(
			{
				loadItems,
			},
			"/page",
		);

		expect(loadItems).toHaveBeenCalledTimes(1);

		result.current[2]?.setAndApplyFilters({
			foo: "bar",
			baz: "qux",
		});

		await waitFor(() => {
			expect(loadItems).toHaveBeenCalledTimes(2);
		});

		await waitFor(() => {
			expect(locationRef.current?.search).toBe("?foo=bar&baz=qux");
		});

		expect(locationRef.current?.pathname).toBe("/page");
	});

	test("all parameters", async () => {
		const loadItems = mock().mockResolvedValue({
			items: [],
		});

		const { result, locationRef } = setup(
			{
				loadItems,
			},
			"/page",
		);

		expect(loadItems).toHaveBeenCalledTimes(1);

		result.current[2]?.setAndApplyFilters({
			foo: "bar",
			baz: "qux",
		});

		await waitFor(() => {
			expect(loadItems).toHaveBeenCalledTimes(2);
		});

		result.current[2]?.setPageSize(20);

		await waitFor(() => {
			expect(loadItems).toHaveBeenCalledTimes(3);
		});

		result.current[2]?.setSorting("id", false);

		await waitFor(() => {
			expect(loadItems).toHaveBeenCalledTimes(4);
		});

		result.current[2]?.setPage(3);

		await waitFor(() => {
			expect(loadItems).toHaveBeenCalledTimes(5);
		});

		await waitFor(() => {
			expect(locationRef.current?.search).toBe(
				"?foo=bar&baz=qux&page=3&page_size=20&sort=-id",
			);
		});

		expect(locationRef.current?.pathname).toBe("/page");
	});
});

test("navigate backward", async () => {
	const loadItems = mock().mockResolvedValue({
		items: [],
	});

	const { result, locationRef, historyRef } = setup(
		{
			loadItems,
		},
		"/page",
	);

	expect(loadItems).toHaveBeenCalledTimes(1);

	result.current[2]?.setAndApplyFilters({
		foo: "bar",
		baz: "qux",
	});

	await waitFor(() => {
		expect(loadItems).toHaveBeenCalledTimes(2);
	});

	result.current[2]?.setPageSize(20);

	await waitFor(() => {
		expect(loadItems).toHaveBeenCalledTimes(3);
	});

	result.current[2]?.setSorting("id", false);

	await waitFor(() => {
		expect(loadItems).toHaveBeenCalledTimes(4);
	});

	result.current[2]?.setPage(3);

	await waitFor(() => {
		expect(loadItems).toHaveBeenCalledTimes(5);
	});

	await waitFor(() => {
		expect(locationRef.current?.search).toBe(
			"?foo=bar&baz=qux&page=3&page_size=20&sort=-id",
		);
	});

	result.current[2]?.resetFilters(["foo", "baz"]);

	await waitFor(() => {
		expect(loadItems).toHaveBeenCalledTimes(6);
	});

	await waitFor(() => {
		expect(locationRef.current?.search).toBe("?page_size=20&sort=-id");
	});

	historyRef.current?.goBack();

	await waitFor(() => {
		expect(loadItems).toHaveBeenCalledTimes(7);
	});

	expect(result.current[2]?.getRequestParams()).toEqual({
		appliedFilters: {
			foo: "bar",
			baz: "qux",
		},
		page: 3,
		pageSize: 20,
		sort: {
			param: "id",
			asc: false,
		},
	});
});

describe("restore page size from local storage", () => {
	test("restore if not defined in url", async () => {
		const pageSizeLocalStorageKey = "filterlist-router/pageSize/restore";

		localStorage.setItem(pageSizeLocalStorageKey, "30");

		const loadItems = mock().mockResolvedValue({
			items: [],
		});

		const { result } = setup(
			{
				loadItems,
				pageSizeLocalStorageKey,
			},
			"/page",
		);

		expect(result.current[2]?.getRequestParams().pageSize).toBe(30);
	});

	test("restore from url", async () => {
		const pageSizeLocalStorageKey = "filterlist-router/pageSize/no_restore";

		localStorage.setItem(pageSizeLocalStorageKey, "30");

		const loadItems = mock().mockResolvedValue({
			items: [],
		});

		const { result } = setup(
			{
				loadItems,
				pageSizeLocalStorageKey,
			},
			"/page?page_size=40",
		);

		expect(result.current[2]?.getRequestParams().pageSize).toBe(40);
	});
});
