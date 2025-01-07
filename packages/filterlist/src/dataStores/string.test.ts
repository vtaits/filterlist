import { describe, expect, test, vi } from "vitest";
import { Filterlist } from "../Filterlist";
import {
	type StringBasedDataStoreOptions,
	createEmitter,
	createStringBasedDataStore,
} from "./string";

const historyEmitter = createEmitter();

window.addEventListener("popstate", () => {
	historyEmitter.emit();
});

function makeCreateDataStore(options: StringBasedDataStoreOptions = {}) {
	const createDataStore = () => {
		return createStringBasedDataStore(
			() => window.location.search,
			(nextSearch) => {
				window.location.href = `${window.location.pathname}?${nextSearch}`;
			},
			historyEmitter,
			options,
		);
	};

	return createDataStore;
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
	{
		href: "/page?foo[]&bar=abc&bar=123&baz=qux",
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
	{
		href: "/page?foo[]+bar=abc+bar=123+baz=qux",
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
])(
	"should parse query correctly: $href",
	({ href, appliedFilters, page, pageSize, sort, options }) => {
		window.location.href = href;

		const filterlist = new Filterlist({
			createDataStore: makeCreateDataStore(options),
			loadItems: vi.fn().mockResolvedValue({
				items: [],
			}),
		});

		expect(filterlist.getRequestParams()).toEqual({
			appliedFilters,
			page,
			pageSize,
			sort,
		});
	},
);

describe.concurrent("should change query", () => {
	test.each([
		{
			filters: {
				foo: "bar",
				baz: "qux",
			},
			search: "?foo=bar&baz=qux",
		},
		{
			filters: {
				foo: [],
				bar: ["abc", "123"],
			},
			search: `?foo[]&bar${encodeURIComponent("[0]")}=abc&bar${encodeURIComponent("[1]")}=123`,
		},
	])("filters to $search", async ({ filters, search }) => {
		window.location.href = "/page";

		const filterlist = new Filterlist({
			createDataStore: makeCreateDataStore(),
			loadItems: vi.fn().mockResolvedValue({
				items: [],
			}),
		});

		filterlist.setAndApplyFilters(filters);

		await vi.waitFor(() => {
			expect(window.location.search).toBe(search);
		});

		expect(window.location.pathname).toBe("/page");
	});

	test("redefine `stringifyOptions`", async () => {
		window.location.href = "/page";

		const filterlist = new Filterlist({
			createDataStore: makeCreateDataStore({
				stringifyOptions: {
					allowEmptyArrays: false,
					arrayFormat: "repeat",
				},
			}),
			loadItems: vi.fn().mockResolvedValue({
				items: [],
			}),
		});

		filterlist.setAndApplyFilters({
			foo: [],
			bar: ["abc", "123"],
		});

		await vi.waitFor(() => {
			expect(window.location.search).toBe("?bar=abc&bar=123");
		});

		expect(window.location.pathname).toBe("/page");
	});

	test("all parameters", async () => {
		window.location.href = "/page";

		const filterlist = new Filterlist({
			createDataStore: makeCreateDataStore(),
			loadItems: vi.fn().mockResolvedValue({
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

		await vi.waitFor(() => {
			expect(window.location.search).toBe(
				"?foo=bar&baz=qux&page=3&page_size=20&sort=-id",
			);
		});

		expect(window.location.pathname).toBe("/page");
	});
});

test("navigate backward", async () => {
	window.location.href = "/page";

	const filterlist = new Filterlist({
		createDataStore: makeCreateDataStore(),
		loadItems: vi.fn().mockResolvedValue({
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

	await vi.waitFor(() => {
		expect(window.location.search).toBe(
			"?foo=bar&baz=qux&page=3&page_size=20&sort=-id",
		);
	});

	filterlist.resetFilters(["foo", "baz"]);

	await vi.waitFor(() => {
		expect(window.location.search).toBe("?page_size=20&sort=-id");
	});

	window.location.search = "?foo=bar&baz=qux&page=3&page_size=20&sort=-id";

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
