import { renderHook } from "@testing-library/react-hooks";
import type { StringBasedDataStoreOptions } from "@vtaits/filterlist/dist/datastore_string";
import { type Params, useFilterlist } from "@vtaits/react-filterlist";
import type { History, Location } from "history";
import type { PropsWithChildren } from "react";
import { MemoryRouter, Route, useHistory, useLocation } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { useCreateDataStore } from "./useCreateDataStore";

function useCompositeHook(
	params: Params<unknown, unknown, unknown, unknown>,
	options: StringBasedDataStoreOptions = {},
) {
	const createDataStore = useCreateDataStore(options);

	return useFilterlist({
		...params,
		createDataStore,
	});
}

let globalHistory: History<unknown> = {} as unknown as History<unknown>;

let globalLocation: Location<unknown> = {
	state: "",
	hash: "",
	key: "",
	pathname: "",
	search: "",
};

function TestRouteComponent() {
	const history = useHistory();
	const location = useLocation();

	globalLocation = location;
	globalHistory = history;

	return null;
}

function setup(
	params: Params<unknown, unknown, unknown, unknown>,
	href: string,
	options: StringBasedDataStoreOptions = {},
) {
	const wrapper = ({ children }: PropsWithChildren) => (
		<MemoryRouter initialEntries={[href]}>
			{children}

			<Route path="/page" component={TestRouteComponent} />
		</MemoryRouter>
	);
	const { result } = renderHook(() => useCompositeHook(params, options), {
		wrapper,
	});

	return result;
}

test.concurrent.each([
	{
		href: "/page",
		appliedFilters: {},
		page: 1,
		pageSize: undefined,
		sort: {
			param: undefined,
			asc: true,
		},
		options: undefined,
	},
	{
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
	({ href, appliedFilters, page, pageSize, sort, options }) => {
		const result = setup(
			{
				loadItems: vi.fn().mockResolvedValue({
					items: [],
				}),
			},
			href,
			options,
		);

		expect(result.current[2]?.getRequestParams()).toEqual({
			appliedFilters,
			page,
			pageSize,
			sort,
		});
	},
);

describe.concurrent("should change query", () => {
	test("only filters", async () => {
		const result = setup(
			{
				loadItems: vi.fn().mockResolvedValue({
					items: [],
				}),
			},
			"/page",
		);

		result.current[2]?.setAndApplyFilters({
			foo: "bar",
			baz: "qux",
		});

		await vi.waitFor(() => {
			expect(globalLocation.search).toBe("?foo=bar&baz=qux");
		});

		expect(globalLocation.pathname).toBe("/page");
	});

	test("all parameters", async () => {
		const result = setup(
			{
				loadItems: vi.fn().mockResolvedValue({
					items: [],
				}),
			},
			"/page",
		);

		result.current[2]?.setAndApplyFilters({
			foo: "bar",
			baz: "qux",
		});
		result.current[2]?.setPageSize(20);
		result.current[2]?.setSorting("id", false);
		result.current[2]?.setPage(3);

		await vi.waitFor(() => {
			expect(globalLocation.search).toBe(
				"?foo=bar&baz=qux&page=3&page_size=20&sort=-id",
			);
		});

		expect(globalLocation.pathname).toBe("/page");
	});
});

test.concurrent("navigate backward", async () => {
	const result = setup(
		{
			loadItems: vi.fn().mockResolvedValue({
				items: [],
			}),
		},
		"/page",
	);

	result.current[2]?.setAndApplyFilters({
		foo: "bar",
		baz: "qux",
	});
	result.current[2]?.setPageSize(20);
	result.current[2]?.setSorting("id", false);
	result.current[2]?.setPage(3);

	await vi.waitFor(() => {
		expect(globalLocation.search).toBe(
			"?foo=bar&baz=qux&page=3&page_size=20&sort=-id",
		);
	});

	result.current[2]?.resetFilters(["foo", "baz"]);

	await vi.waitFor(() => {
		expect(globalLocation.search).toBe("?page_size=20&sort=-id");
	});

	globalHistory.goBack();

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
