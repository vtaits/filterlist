import { describe, expect, test, vi } from "vitest";
import type { ItemsLoader } from "../dist/core";
import { Filterlist } from "./Filterlist";
import type { DataStore, DataStoreListener, RequestParams } from "./types";

export function createAsyncDataStore(initalValue: RequestParams): DataStore {
	let value = initalValue;
	let listeners: DataStoreListener[] = [];

	const setValue = (nextValue: Partial<RequestParams>) => {
		const prevValue = value;

		value = {
			...prevValue,
			...nextValue,
		};

		for (const listener of listeners) {
			setTimeout(() => {
				listener(value, prevValue);
			});
		}
	};

	return {
		getValue: () => value,
		setValue: setValue,
		subscribe: (listener) => {
			listeners.push(listener);

			return () => {
				listeners = listeners.filter((item) => item !== listener);
			};
		},
	};
}

describe.each([
	{ name: "default", createDataStore: undefined },
	{ name: "async", createDataStore: createAsyncDataStore },
])("data store: $name", ({ createDataStore }) => {
	describe("init", () => {
		test("load items on init", async () => {
			const loadItems = vi.fn().mockResolvedValue({
				items: [1, 2, 3],
			});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loading).toBe(true);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			const listState = filterlist.getListState();

			expect(listState.items).toEqual([1, 2, 3]);
			expect(listState.loading).toBe(false);
		});

		test("not load items on init", async () => {
			const loadItems = vi.fn().mockResolvedValue({
				items: [1, 2, 3],
			});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
				autoload: false,
			});

			expect(filterlist.getListState().loading).toBe(false);
		});

		test("load with default params", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValue({
					items: [1, 2, 3],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loading).toBe(true);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			const [requestParams, listState] = loadItems.mock.calls[0];

			expect(requestParams.appliedFilters).toEqual({});
			expect(requestParams.page).toBe(1);
			expect(requestParams.pageSize).toBeFalsy();
			expect(requestParams.sort).toEqual({
				param: null,
				asc: true,
			});

			expect(listState.additional).toBe(null);
			expect(listState.filters).toEqual({});
			expect(listState.items).toEqual([]);
			expect(listState.total).toBeFalsy();
		});

		test("load with redefined params", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValue({
					items: [1, 2, 3],
				});

			const filterlist = new Filterlist({
				appliedFilters: {
					foo: "bar",
				},
				additional: {
					baz: "qux",
				},
				sort: {
					param: "id",
					asc: false,
				},
				page: 12,
				total: 2000,
				pageSize: 20,
				items: [4, 5, 6],
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loading).toBe(true);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			const [requestParams, listState] = loadItems.mock.calls[0];

			expect(requestParams.appliedFilters).toEqual({
				foo: "bar",
			});
			expect(requestParams.page).toBe(12);
			expect(requestParams.pageSize).toBe(20);
			expect(requestParams.sort).toEqual({
				param: "id",
				asc: false,
			});

			expect(listState.additional).toEqual({
				baz: "qux",
			});
			expect(listState.filters).toEqual({
				foo: "bar",
			});
			expect(listState.items).toEqual([4, 5, 6]);
			expect(listState.total).toBe(2000);
		});
	});

	test("set total", async () => {
		const loadItems = vi.fn().mockResolvedValue({
			items: [1, 2, 3],
			total: 15,
		});

		const filterlist = new Filterlist({
			createDataStore,
			loadItems,
		});

		await vi.waitFor(() => {
			expect(loadItems).toHaveBeenCalledTimes(1);
		});

		const listState = filterlist.getListState();

		expect(listState.total).toEqual(15);
	});

	test("set additional", async () => {
		const loadItems = vi.fn().mockResolvedValue({
			items: [1, 2, 3],
			additional: {
				foo: "bar",
			},
		});

		const filterlist = new Filterlist({
			createDataStore,
			loadItems,
		});

		await vi.waitFor(() => {
			expect(loadItems).toHaveBeenCalledTimes(1);
		});

		const listState = filterlist.getListState();

		expect(listState.additional).toEqual({
			foo: "bar",
		});
	});

	describe("load items methods", () => {
		test.todo("loadMore", () => {});

		test.todo("applyFilter", () => {});

		test.todo("setAndApplyFilter", () => {});

		test.todo("resetFilter", () => {});

		test.todo("applyFilters", () => {});

		test.todo("setAndApplyFilters", () => {});

		test.todo("setPage", () => {});

		test.todo("setPageSize", () => {});

		test.todo("resetFilters", () => {});

		test.todo("resetAllFilters", () => {});

		test.todo("setSorting", () => {});

		test.todo("resetSorting", () => {});

		test.todo("reload", () => {});
	});

	describe("change internal state methods", () => {
		test("setTotal", () => {
			const filterlist = new Filterlist({
				loadItems: vi.fn().mockResolvedValue({
					items: [],
				}),
			});

			filterlist.setTotal(50);

			expect(filterlist.getListState().total).toBe(50);
		});

		test.todo("insertItem", () => {});

		test.todo("deleteItem", () => {});

		test.todo("updateItem", () => {});
	});

	describe("debounce", () => {
		test.todo.each([
			{
				name: "debounced",
				debounceTimeout: 300,
			},
			{
				name: "not debounced",
				debounceTimeout: undefined,
			},
		])("$name", ({ debounceTimeout }) => {});
	});

	test.todo("auto refresh", () => {
		test.todo.each([
			{
				name: "enabled",
				refreshTimeout: 300,
			},
			{
				name: "disabled",
				refreshTimeout: undefined,
			},
		])("$name", ({ refreshTimeout }) => {});
	});
});
