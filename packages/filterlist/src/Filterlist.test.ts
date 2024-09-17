import sleep from "sleep-promise";
import { describe, expect, test, vi } from "vitest";
import { Filterlist } from "./Filterlist";
import { LoadListError } from "./errors";
import type {
	DataStore,
	DataStoreListener,
	ItemsLoader,
	RequestParams,
} from "./types";

export function createAsyncDataStore(initalValue: RequestParams): DataStore {
	let value = initalValue;
	let listeners: DataStoreListener[] = [];

	const setValue = (nextValue: Partial<RequestParams>) => {
		const prevValue = value;

		value = {
			...prevValue,
			...nextValue,
		};

		const currentValue = value;

		for (const listener of listeners) {
			setTimeout(() => {
				listener(currentValue, prevValue);
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

describe.concurrent.each([
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

		test("load failed", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockRejectedValue(
					new LoadListError({
						error: "test error",
						additional: {
							baz: "qux",
						},
						total: 123,
					}),
				);

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loading).toBe(true);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			const listState = filterlist.getListState();

			expect(filterlist.getListState().loading).toBe(false);
			expect(listState.additional).toEqual({
				baz: "qux",
			});
			expect(listState.error).toBe("test error");
			expect(listState.items).toEqual([]);
			expect(listState.total).toBe(123);
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
		test("loadMore", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			filterlist.loadMore();

			expect(filterlist.getListState().loadedPages).toEqual(1);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([1, 2, 3, 4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(2);

			const [_requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestListState.items).toEqual([1, 2, 3]);
		});

		test("applyFilter", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.setFilterValue("foo", "bar");
			filterlist.applyFilter("foo");

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.appliedFilters).toEqual({
				foo: "bar",
			});

			expect(requestListState.items).toEqual([]);
		});

		test("setAndApplyFilter", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.setAndApplyFilter("foo", "bar");

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.appliedFilters).toEqual({
				foo: "bar",
			});

			expect(requestListState.items).toEqual([]);
		});

		test("resetFilter", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				appliedFilters: {
					foo: "bar",
				},
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.resetFilter("foo");

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.appliedFilters).toEqual({});

			expect(requestListState.items).toEqual([]);
		});

		test("applyFilters", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.setFiltersValues({
				foo: "bar",
				baz: "qux",
			});
			filterlist.applyFilters(["foo", "baz"]);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.appliedFilters).toEqual({
				foo: "bar",
				baz: "qux",
			});

			expect(requestListState.items).toEqual([]);
		});

		test("setAndApplyFilters", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.setAndApplyFilters({
				foo: "bar",
				baz: "qux",
			});

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.appliedFilters).toEqual({
				foo: "bar",
				baz: "qux",
			});

			expect(requestListState.items).toEqual([]);
		});

		test("setAndApplyEmptyFilters", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
				appliedFilters: {
					foo: "123",
					bar: null,
					baz: undefined,
				},
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.setAndApplyEmptyFilters({
				foo: "a",
				bar: "b",
				baz: "c",
				qux: "d",
				bat: "e",
			});

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(loadItems).toHaveBeenNthCalledWith(
				2,
				{
					appliedFilters: {
						foo: "123",
						bar: null,
						baz: "c",
						qux: "d",
						bat: "e",
					},
					page: 1,
					pageSize: undefined,
					sort: expect.anything(),
				},
				expect.anything(),
			);

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.appliedFilters).toEqual({
				foo: "123",
				bar: null,
				baz: "c",
				qux: "d",
				bat: "e",
			});

			expect(requestListState.items).toEqual([]);
		});

		test("resetFilters", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				appliedFilters: {
					foo: "bar",
					baz: "qux",
				},
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.resetFilters(["foo", "baz"]);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.appliedFilters).toEqual({});

			expect(requestListState.items).toEqual([]);
		});

		test("resetAllFilters", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				appliedFilters: {
					foo: "bar",
					baz: "qux",
				},
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.resetAllFilters();

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.appliedFilters).toEqual({});

			expect(requestListState.items).toEqual([]);
		});

		test("setPage", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.setPage(3);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.page).toBe(3);
			expect(requestListState.items).toEqual([]);
		});

		test("setPageSize", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.setPageSize(30);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.pageSize).toBe(30);
			expect(requestListState.items).toEqual([]);
		});

		describe("setSorting", () => {
			test("with asc", async () => {
				const loadItems = vi
					.fn<ItemsLoader<unknown, unknown, unknown>>()
					.mockResolvedValueOnce({
						items: [1, 2, 3],
					})
					.mockResolvedValueOnce({
						items: [4, 5, 6],
					});

				const filterlist = new Filterlist({
					createDataStore,
					loadItems,
				});

				expect(filterlist.getListState().loadedPages).toEqual(0);

				await vi.waitFor(() => {
					expect(loadItems).toHaveBeenCalledTimes(1);
				});

				expect(filterlist.getListState().loadedPages).toEqual(1);

				filterlist.setSorting("id", true);

				await vi.waitFor(() => {
					expect(loadItems).toHaveBeenCalledTimes(2);
				});

				expect(filterlist.getListState().items).toEqual([4, 5, 6]);
				expect(filterlist.getListState().loadedPages).toEqual(1);

				const [requestParams, requestListState] = loadItems.mock.calls[1];

				expect(requestParams.sort).toEqual({
					param: "id",
					asc: true,
				});
				expect(requestListState.items).toEqual([]);
			});

			test("without asc", async () => {
				const loadItems = vi
					.fn<ItemsLoader<unknown, unknown, unknown>>()
					.mockResolvedValueOnce({
						items: [1, 2, 3],
					})
					.mockResolvedValueOnce({
						items: [4, 5, 6],
					});

				const filterlist = new Filterlist({
					createDataStore,
					loadItems,
					sort: {
						param: "test",
						asc: false,
					},
				});

				expect(filterlist.getListState().loadedPages).toEqual(0);

				await vi.waitFor(() => {
					expect(loadItems).toHaveBeenCalledTimes(1);
				});

				expect(filterlist.getListState().loadedPages).toEqual(1);

				filterlist.setSorting("id");

				await vi.waitFor(() => {
					expect(loadItems).toHaveBeenCalledTimes(2);
				});

				expect(filterlist.getListState().items).toEqual([4, 5, 6]);
				expect(filterlist.getListState().loadedPages).toEqual(1);

				const [requestParams, requestListState] = loadItems.mock.calls[1];

				expect(requestParams.sort).toEqual({
					param: "id",
					asc: true,
				});
				expect(requestListState.items).toEqual([]);
			});

			test("toggle asc", async () => {
				const loadItems = vi
					.fn<ItemsLoader<unknown, unknown, unknown>>()
					.mockResolvedValueOnce({
						items: [1, 2, 3],
					})
					.mockResolvedValueOnce({
						items: [4, 5, 6],
					});

				const filterlist = new Filterlist({
					createDataStore,
					loadItems,
					sort: {
						param: "id",
						asc: true,
					},
				});

				expect(filterlist.getListState().loadedPages).toEqual(0);

				await vi.waitFor(() => {
					expect(loadItems).toHaveBeenCalledTimes(1);
				});

				expect(filterlist.getListState().loadedPages).toEqual(1);

				filterlist.setSorting("id");

				await vi.waitFor(() => {
					expect(loadItems).toHaveBeenCalledTimes(2);
				});

				expect(filterlist.getListState().items).toEqual([4, 5, 6]);
				expect(filterlist.getListState().loadedPages).toEqual(1);

				const [requestParams, requestListState] = loadItems.mock.calls[1];

				expect(requestParams.sort).toEqual({
					param: "id",
					asc: false,
				});
				expect(requestListState.items).toEqual([]);
			});
		});

		test("resetSorting", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
				sort: {
					param: "id",
					asc: true,
				},
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.resetSorting();

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.sort).toEqual({
				param: null,
				asc: true,
			});
			expect(requestListState.items).toEqual([]);
		});

		test("reload", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
				appliedFilters: {
					foo: "bar",
				},
				page: 3,
				pageSize: 20,
				sort: {
					param: "id",
					asc: true,
				},
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.reload();

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams).toEqual({
				appliedFilters: {
					foo: "bar",
				},
				page: 3,
				pageSize: 20,
				sort: {
					param: "id",
					asc: true,
				},
			});
			expect(requestListState.items).toEqual([]);
		});
	});

	describe("reset page", () => {
		test("on filter change", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
				page: 3,
				pageSize: 20,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.setAndApplyFilters({});

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.page).toBe(1);
			expect(requestParams.pageSize).toBe(20);
			expect(requestListState.items).toEqual([]);
		});

		test("on sort change", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
				page: 3,
				pageSize: 20,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.resetSorting();

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.page).toBe(1);
			expect(requestParams.pageSize).toBe(20);
			expect(requestListState.items).toEqual([]);
		});

		test("on page size change", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
				page: 3,
				pageSize: 20,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.setPageSize(50);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.page).toBe(1);
			expect(requestParams.pageSize).toBe(50);
			expect(requestListState.items).toEqual([]);
		});
	});

	describe("change internal state methods", () => {
		test("setTotal", () => {
			const filterlist = new Filterlist({
				createDataStore,
				loadItems: vi.fn().mockResolvedValue({
					items: [],
				}),
			});

			filterlist.setTotal(50);

			expect(filterlist.getListState().total).toBe(50);
		});

		test("insertItem", async () => {
			const filterlist = new Filterlist({
				createDataStore,
				loadItems: vi.fn().mockResolvedValue({
					items: [1, 2, 3],
				}),
			});

			await vi.waitFor(() => {
				expect(filterlist.getListState().items.length).toBeGreaterThan(0);
			});

			filterlist.insertItem(2, 4);

			expect(filterlist.getListState().items).toEqual([1, 2, 4, 3]);
		});

		test("deleteItem", async () => {
			const filterlist = new Filterlist({
				createDataStore,
				loadItems: vi.fn().mockResolvedValue({
					items: [1, 2, 3],
				}),
			});

			await vi.waitFor(() => {
				expect(filterlist.getListState().items.length).toBeGreaterThan(0);
			});

			filterlist.deleteItem(1);

			expect(filterlist.getListState().items).toEqual([1, 3]);
		});

		test("updateItem", async () => {
			const filterlist = new Filterlist({
				createDataStore,
				loadItems: vi.fn().mockResolvedValue({
					items: [1, 2, 3],
				}),
			});

			await vi.waitFor(() => {
				expect(filterlist.getListState().items.length).toBeGreaterThan(0);
			});

			filterlist.updateItem(1, 4);

			expect(filterlist.getListState().items).toEqual([1, 4, 3]);
		});
	});

	describe("debounce", () => {
		test("debounced", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValue({
					items: [1, 2, 3],
				});

			const filterlist = new Filterlist({
				createDataStore,
				debounceTimeout: 300,
				loadItems,
			});

			filterlist.setAndApplyFilter("foo", "bar");
			filterlist.setAndApplyFilter("foo", "baz");
			filterlist.setAndApplyFilter("foo", "qux");

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			const [requestParams] = loadItems.mock.calls[0];

			expect(requestParams.appliedFilters.foo).toBe("qux");
		});

		test("not debounced", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValue({
					items: [1, 2, 3],
				})
				.mockResolvedValue({
					items: [4, 5, 6],
				})
				.mockResolvedValue({
					items: [7, 8, 9],
				})
				.mockResolvedValue({
					items: [10, 11, 12],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
			});

			setTimeout(() => {
				filterlist.setAndApplyFilter("foo", "bar");
			});
			setTimeout(() => {
				filterlist.setAndApplyFilter("foo", "baz");
			});
			setTimeout(() => {
				filterlist.setAndApplyFilter("foo", "qux");
			});

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(4);
			});

			expect(filterlist.getListState().items).toEqual([10, 11, 12]);
		});
	});

	describe("auto refresh", () => {
		test("disabled", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValue({
					items: [1, 2, 3],
				})
				.mockResolvedValue({
					items: [4, 5, 6],
				})
				.mockResolvedValue({
					items: [7, 8, 9],
				})
				.mockResolvedValue({
					items: [10, 11, 12],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
			});

			await sleep(160);

			expect(loadItems).toHaveBeenCalledTimes(1);

			filterlist.destroy();
		});

		test("enabled", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValue({
					items: [1, 2, 3],
				})
				.mockResolvedValue({
					items: [4, 5, 6],
				})
				.mockResolvedValue({
					items: [7, 8, 9],
				})
				.mockResolvedValue({
					items: [10, 11, 12],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
				refreshTimeout: 50,
			});

			await sleep(160);

			expect(loadItems).toHaveBeenCalledTimes(4);

			filterlist.destroy();
		});

		test("disable by shouldRefresh", async () => {
			let callNumber = 0;
			const shouldRefresh = () => {
				const res = callNumber % 2 === 0;

				++callNumber;

				return res;
			};

			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValue({
					items: [1, 2, 3],
				})
				.mockResolvedValue({
					items: [4, 5, 6],
				})
				.mockResolvedValue({
					items: [7, 8, 9],
				})
				.mockResolvedValue({
					items: [10, 11, 12],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
				refreshTimeout: 50,
				shouldRefresh,
			});

			await sleep(210);

			expect(loadItems).toHaveBeenCalledTimes(3);

			filterlist.destroy();
		});
	});

	describe("save items while loading", () => {
		test("not save", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
			});

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().items).toEqual([1, 2, 3]);

			filterlist.setAndApplyFilter("foo", "bar");

			expect(filterlist.getListState().items).toEqual([]);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
		});

		test("save", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				createDataStore,
				loadItems,
				saveItemsWhileLoad: true,
			});

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().items).toEqual([1, 2, 3]);

			filterlist.setAndApplyFilter("foo", "bar");

			expect(filterlist.getListState().items).toEqual([1, 2, 3]);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
		});
	});

	describe("reset values of filters", () => {
		test("resetFilter", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				appliedFilters: {
					foo: "bar",
				},
				resetFiltersTo: {
					foo: "default_foo",
				},
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.resetFilter("foo");

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.appliedFilters).toEqual({
				foo: "default_foo",
			});

			expect(requestListState.items).toEqual([]);
		});

		test("resetFilters", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				appliedFilters: {
					foo: "bar",
					baz: "qux",
				},
				resetFiltersTo: {
					foo: "default_foo",
					baz: "default_baz",
				},
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.resetFilters(["foo", "baz"]);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.appliedFilters).toEqual({
				foo: "default_foo",
				baz: "default_baz",
			});

			expect(requestListState.items).toEqual([]);
		});

		test("resetAllFilters", async () => {
			const loadItems = vi
				.fn<ItemsLoader<unknown, unknown, unknown>>()
				.mockResolvedValueOnce({
					items: [1, 2, 3],
				})
				.mockResolvedValueOnce({
					items: [4, 5, 6],
				});

			const filterlist = new Filterlist({
				appliedFilters: {
					foo: "bar",
					baz: "qux",
				},
				resetFiltersTo: {
					foo: "default_foo",
					baz: "default_baz",
				},
				createDataStore,
				loadItems,
			});

			expect(filterlist.getListState().loadedPages).toEqual(0);

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(1);
			});

			expect(filterlist.getListState().loadedPages).toEqual(1);

			filterlist.resetAllFilters();

			await vi.waitFor(() => {
				expect(loadItems).toHaveBeenCalledTimes(2);
			});

			expect(filterlist.getListState().items).toEqual([4, 5, 6]);
			expect(filterlist.getListState().loadedPages).toEqual(1);

			const [requestParams, requestListState] = loadItems.mock.calls[1];

			expect(requestParams.appliedFilters).toEqual({
				foo: "default_foo",
				baz: "default_baz",
			});

			expect(requestListState.items).toEqual([]);
		});
	});

	test("setRefreshTimeout", async () => {
		const loadItems = vi
			.fn<ItemsLoader<unknown, unknown, unknown>>()
			.mockResolvedValue({
				items: [],
			});

		const filterlist = new Filterlist({
			createDataStore,
			loadItems,
		});

		await sleep(50);

		expect(loadItems).toHaveBeenCalledTimes(1);
		loadItems.mockClear();

		filterlist.setRefreshTimeout(30);

		await sleep(100);

		expect(loadItems).toHaveBeenCalledTimes(3);
		loadItems.mockClear();

		filterlist.setRefreshTimeout(null);

		expect(loadItems).toHaveBeenCalledTimes(0);

		filterlist.destroy();
	});
});
