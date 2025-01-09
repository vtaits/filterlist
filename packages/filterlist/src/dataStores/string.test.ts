import { describe, expect, mock, test } from "bun:test";
import { waitFor } from "@testing-library/dom";
import { Signal } from "signal-polyfill";
import { Filterlist } from "../Filterlist";
import {
	type StringBasedDataStoreOptions,
	createStringBasedDataStore,
} from "./string";

const searchSignal = new Signal.State("");
const ORIGIN = "http://localhost";

window.addEventListener("popstate", () => {
	searchSignal.set(window.location.search);
});

function makeCreateDataStore(options: StringBasedDataStoreOptions = {}) {
	const createDataStore = () => {
		return createStringBasedDataStore(
			searchSignal,
			(nextSearch) => {
				window.location.href = `${ORIGIN}${window.location.pathname}?${nextSearch}`;
				window.dispatchEvent(new PopStateEvent("popstate"));
			},
			options,
		);
	};

	return createDataStore;
}

test.each([
	[
		"/page",
		{
			appliedFilters: {},
			page: 1,
			pageSize: undefined,
			sort: {
				param: undefined,
				asc: true,
			},
			options: undefined,
		},
	],
	[
		"/page?page=3&page_size=20&sort=-id&foo=bar&baz=qux",
		{
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
	],
	[
		"/page?page=3&page_size=20&sort=id&foo=bar&baz=qux",
		{
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
	],
	[
		"/page?test_page=3&test_page_size=20&test_sort=id&foo=bar&baz=qux",
		{
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
	],
	[
		"/page?foo[]&bar=abc&bar=123&baz=qux",
		{
			appliedFilters: {
				foo: [],
				bar: ["abc", "123"],
				baz: "qux",
			},
			page: 1,
			pageSize: undefined,
			sort: {
				param: undefined,
				asc: true,
			},
			options: undefined,
		},
	],
	[
		"/page?foo[]+bar=abc+bar=123+baz=qux",
		{
			appliedFilters: {
				foo: [""],
				bar: ["abc", "123"],
				baz: "qux",
			},
			page: 1,
			pageSize: undefined,
			sort: {
				param: undefined,
				asc: true,
			},
			options: {
				parseOptions: {
					allowEmptyArrays: false,
					delimiter: "+",
				},
			},
		},
	],
])(
	"should parse query correctly: %s",
	async (href, { appliedFilters, page, pageSize, sort, options }) => {
		window.location.href = `${ORIGIN}${href}`;
		window.dispatchEvent(new PopStateEvent("popstate"));

		const filterlist = new Filterlist({
			createDataStore: makeCreateDataStore(options),
			loadItems: mock().mockResolvedValue({
				items: [],
			}),
		});

		await waitFor(() => {
			expect(filterlist.getRequestParams()).toEqual({
				appliedFilters,
				page,
				pageSize,
				sort,
			});
		});
	},
);

describe("should change query", () => {
	test.each([
		[
			"?foo=bar&baz=qux",
			{
				filters: {
					foo: "bar",
					baz: "qux",
				},
			},
		],
		[
			`?foo[]&bar${encodeURIComponent("[0]")}=abc&bar${encodeURIComponent("[1]")}=123`,
			{
				filters: {
					foo: [],
					bar: ["abc", "123"],
				},
			},
		],
	])("filters to $search", async (search, { filters }) => {
		window.location.href = `${ORIGIN}/page`;
		window.dispatchEvent(new PopStateEvent("popstate"));

		const filterlist = new Filterlist({
			createDataStore: makeCreateDataStore(),
			loadItems: mock().mockResolvedValue({
				items: [],
			}),
		});

		filterlist.setAndApplyFilters(filters);

		await waitFor(() => {
			expect(window.location.search).toBe(search);
		});

		expect(window.location.pathname).toBe("/page");
	});

	test("redefine `stringifyOptions`", async () => {
		window.location.href = `${ORIGIN}/page`;
		window.dispatchEvent(new PopStateEvent("popstate"));

		const filterlist = new Filterlist({
			createDataStore: makeCreateDataStore({
				stringifyOptions: {
					allowEmptyArrays: false,
					arrayFormat: "repeat",
				},
			}),
			loadItems: mock().mockResolvedValue({
				items: [],
			}),
		});

		filterlist.setAndApplyFilters({
			foo: [],
			bar: ["abc", "123"],
		});

		await waitFor(() => {
			expect(window.location.search).toBe("?bar=abc&bar=123");
		});

		expect(window.location.pathname).toBe("/page");
	});

	test("all parameters", async () => {
		window.location.href = `${ORIGIN}/page`;
		window.dispatchEvent(new PopStateEvent("popstate"));

		const filterlist = new Filterlist({
			createDataStore: makeCreateDataStore(),
			loadItems: mock().mockResolvedValue({
				items: [],
			}),
		});

		filterlist.setAndApplyFilters({
			foo: "bar",
			baz: "qux",
		});
		filterlist.setPageSize(20);
		filterlist.setSorting("id", false);
		filterlist.setPage(3);

		await waitFor(() => {
			expect(window.location.search).toBe(
				"?foo=bar&baz=qux&page=3&page_size=20&sort=-id",
			);
		});

		expect(window.location.pathname).toBe("/page");
	});
});

test("navigate backward", async () => {
	window.location.href = `${ORIGIN}/page`;
	window.dispatchEvent(new PopStateEvent("popstate"));

	const filterlist = new Filterlist({
		createDataStore: makeCreateDataStore(),
		loadItems: mock().mockResolvedValue({
			items: [],
		}),
	});

	filterlist.setAndApplyFilters({
		foo: "bar",
		baz: "qux",
	});
	filterlist.setPageSize(20);
	filterlist.setSorting("id", false);
	filterlist.setPage(3);

	await waitFor(() => {
		expect(window.location.search).toBe(
			"?foo=bar&baz=qux&page=3&page_size=20&sort=-id",
		);
	});

	filterlist.resetFilters(["foo", "baz"]);

	await waitFor(() => {
		expect(window.location.search).toBe("?page_size=20&sort=-id");
	});

	window.location.search = "?foo=bar&baz=qux&page=3&page_size=20&sort=-id";
	window.dispatchEvent(new PopStateEvent("popstate"));

	await waitFor(() => {
		expect(filterlist.getRequestParams()).toEqual({
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
});
