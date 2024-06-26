import sleep from "sleep-promise";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Filterlist } from "./Filterlist";
import { collectListInitialState } from "./collectListInitialState";
import { collectOptions } from "./collectOptions";
import { LoadListError } from "./errors";
import * as eventTypes from "./eventTypes";
import type { ItemsLoaderResponse, ListState } from "./types";

vi.mock("sleep-promise");

vi.spyOn(global, "setTimeout");
vi.spyOn(global, "clearTimeout");

// biome-ignore lint/suspicious/noExplicitAny: stub for any filterlist
const testListState: ListState<any, any, any> = {
	items: ["test"],
	additional: "test",
	filters: {},
	appliedFilters: {},
	loading: false,
	shouldClean: false,
	isFirstLoad: false,
	loadedPages: 3,
	sort: {
		asc: false,
	},
	page: 1,
	error: null,
};

const defaultParams = {
	loadItems: (): ItemsLoaderResponse<unknown, unknown> => ({
		items: [],
	}),
};

type CallType =
	| "loadMore"
	| "onInit"
	| "requestItems"
	| "onSuccess"
	| "onError"
	| "onChangeListState"
	| "onLoadItems"
	| "itemsLoader"
	| "onRequestItems";

let callsSequence: CallType[] = [];

const loadItemsOnInitMethod = vi.fn(() => {
	callsSequence.push("loadMore");
	return Promise.resolve();
});
const onInitMethod = vi.fn(() => {
	callsSequence.push("onInit");
});
const requestItemsMethod = vi.fn(() => {
	callsSequence.push("requestItems");
	return Promise.resolve();
});
const onSuccessMethod = vi.fn<[ItemsLoaderResponse<unknown, unknown>]>(() => {
	callsSequence.push("onSuccess");
});
const onErrorMethod = vi.fn<[LoadListError<unknown, unknown>]>(() => {
	callsSequence.push("onError");
});
const onChangeListStateMethod = vi.fn<[ListState<unknown, unknown, unknown>]>(
	() => {
		callsSequence.push("onChangeListState");
	},
);

class ManualFilterlist<Item, Additional, Error> extends Filterlist<
	Item,
	Additional,
	Error
> {
	loadItemsOnInit(): Promise<void> {
		return loadItemsOnInitMethod();
	}

	manualLoadItemsOnInit(): Promise<void> {
		return super.loadItemsOnInit();
	}

	onInit(): void {
		onInitMethod();
	}

	manualOnInit(): void {
		super.onInit();
	}

	requestItems(): Promise<void> {
		return requestItemsMethod();
	}

	manualRequestItems(
		prevListState: ListState<Item, Additional, Error>,
	): Promise<void> {
		return super.requestItems(prevListState);
	}

	onSuccess(response: ItemsLoaderResponse<Item, Additional>): void {
		onSuccessMethod(response);
	}

	manualOnSuccess(response: ItemsLoaderResponse<Item, Additional>): void {
		super.onSuccess(response);
	}

	onError(error: LoadListError<Error, Additional>): void {
		onErrorMethod(error);
	}

	manualOnError(error: LoadListError<Error, Additional>): void {
		super.onError(error);
	}

	setListState(nextListState: ListState<Item, Additional, Error>): void {
		super.setListState(nextListState);

		onChangeListStateMethod(nextListState);
	}
}

afterEach(() => {
	callsSequence = [];

	vi.clearAllMocks();
});

test("should throw an exception if loadItems is not defined", () => {
	expect(() => {
		// @ts-ignore
		new ManualFilterlist({});
	}).toThrowError("loadItems is required");
});

test("should throw an exception if loadItems is not a function", () => {
	expect(() => {
		new ManualFilterlist({
			// @ts-ignore
			loadItems: 123,
		});
	}).toThrowError("loadItems should be a function");
});

test("should collect listState on init", () => {
	const params = {
		...defaultParams,

		sort: {
			param: "param",
			asc: false,
		},

		appliedFilters: {
			filter1: "value1",
			filter2: "value2",
			filter3: ["value3", "value4"],
		},

		additional: {
			count: 0,
		},
	};

	const filterlist = new ManualFilterlist(params);

	expect(filterlist.getListState()).toEqual(collectListInitialState(params));
});

test("should collect options on init", () => {
	const params = {
		...defaultParams,

		alwaysResetFilters: {
			filter1: "value1",
			filter2: "value2",
		},
		saveFiltersOnResetAll: ["filter1", "filter2"],
		saveItemsWhileLoad: true,
		autoload: false,
		isDefaultSortAsc: true,
	};

	const filterlist = new ManualFilterlist(params);

	expect(filterlist.options).toEqual(collectOptions(params));
});

test("should set initial requestId", () => {
	const filterlist = new ManualFilterlist({
		...defaultParams,
	});

	expect(filterlist.requestId).toBe(0);
});

test("should set loadItems", () => {
	const loadItems = vi.fn();

	const filterlist = new ManualFilterlist({
		...defaultParams,
		loadItems,
	});

	expect(filterlist.itemsLoader).toBe(loadItems);
});

test("should call onInit on init", () => {
	new ManualFilterlist({
		...defaultParams,
	});

	expect(onInitMethod).toHaveBeenCalledTimes(1);
});

test("should call loadItems on init", () => {
	const filterlist = new ManualFilterlist({
		...defaultParams,
	});

	filterlist.manualOnInit();

	expect(loadItemsOnInitMethod).toHaveBeenCalledTimes(1);
});

test("should not call loadItems on init if autoload is false", () => {
	const filterlist = new ManualFilterlist({
		...defaultParams,
		autoload: false,
	});

	filterlist.manualOnInit();

	expect(loadItemsOnInitMethod).toHaveBeenCalledTimes(0);
});

test("should dispatch event and request items on load items", async () => {
	const filterlist = new ManualFilterlist({
		...defaultParams,
	});

	const onLoadItems = vi.fn(() => {
		callsSequence.push("onLoadItems");
	});

	const prevState = filterlist.getListState();

	filterlist.listState = {
		...prevState,
		loading: false,
		shouldClean: true,
		error: "error",
	};

	filterlist.emitter.on(eventTypes.loadMore, onLoadItems);

	await filterlist.manualLoadItemsOnInit();

	expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

	expect(onLoadItems).toHaveBeenCalledTimes(1);
	expect(onLoadItems).toHaveBeenCalledWith({
		...prevState,
		loading: true,
		shouldClean: false,
		error: null,
	});

	expect(requestItemsMethod).toHaveBeenCalledTimes(1);

	expect(callsSequence).toEqual([
		"onInit",
		"onChangeListState",
		"onLoadItems",
		"requestItems",
	]);
});

describe("requestItems", () => {
	test("should not load items if `shouldRequest` returns `false`", async () => {
		const shouldRequest = vi.fn().mockReturnValue(false);

		const filterlist = new ManualFilterlist({
			...defaultParams,
			shouldRequest,
		});

		const onRequestItems = vi.fn(() => {
			callsSequence.push("onRequestItems");
		});

		filterlist.emitter.on(eventTypes.requestItems, onRequestItems);

		const currentState = filterlist.getListState();

		await filterlist.manualRequestItems(testListState);

		expect(onRequestItems).toHaveBeenCalledTimes(0);

		expect(shouldRequest).toHaveBeenCalledTimes(1);
		expect(shouldRequest).toHaveBeenCalledWith(testListState, currentState);
	});

	test("should load items if `shouldRequest` returns `true`", async () => {
		const shouldRequest = vi.fn().mockReturnValue(true);

		const filterlist = new ManualFilterlist({
			...defaultParams,
			shouldRequest,
		});

		const onRequestItems = vi.fn(() => {
			callsSequence.push("onRequestItems");
		});

		filterlist.emitter.on(eventTypes.requestItems, onRequestItems);

		const currentState = filterlist.getListState();

		await filterlist.manualRequestItems(testListState);

		expect(onRequestItems).toHaveBeenCalledTimes(1);

		expect(shouldRequest).toHaveBeenCalledTimes(1);
		expect(shouldRequest).toHaveBeenCalledWith(testListState, currentState);
	});

	test("should load items if `shouldRequest` is not defined", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const onRequestItems = vi.fn(() => {
			callsSequence.push("onRequestItems");
		});

		filterlist.emitter.on(eventTypes.requestItems, onRequestItems);

		await filterlist.manualRequestItems(testListState);

		expect(onRequestItems).toHaveBeenCalledTimes(1);
	});

	test("should not debounce requests", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const onRequestItems = vi.fn(() => {
			callsSequence.push("onRequestItems");
		});

		filterlist.emitter.on(eventTypes.requestItems, onRequestItems);

		await Promise.all([
			filterlist.manualRequestItems(testListState),
			filterlist.manualRequestItems(testListState),
		]);

		expect(onRequestItems).toHaveBeenCalledTimes(2);

		expect(sleep).toHaveBeenCalledTimes(0);
	});

	test("should debounce requests", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
			debounceTimeout: 100,
		});

		const onRequestItems = vi.fn(() => {
			callsSequence.push("onRequestItems");
		});

		filterlist.emitter.on(eventTypes.requestItems, onRequestItems);

		await Promise.all([
			filterlist.manualRequestItems(testListState),
			filterlist.manualRequestItems(testListState),
		]);

		expect(onRequestItems).toHaveBeenCalledTimes(1);

		expect(sleep).toHaveBeenCalledTimes(2);
		expect(sleep).toHaveBeenNthCalledWith(1, 100);
		expect(sleep).toHaveBeenNthCalledWith(2, 100);
	});

	test("clear refresh timeout before request", async () => {
		const testResponse = {
			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		const loadItems = vi.fn(() => {
			expect(clearTimeout).toHaveBeenCalledTimes(1);
			expect(clearTimeout).toHaveBeenCalledWith(10000);

			callsSequence.push("itemsLoader");

			return testResponse;
		});

		const filterlist = new ManualFilterlist({
			...defaultParams,
			loadItems,
		});

		filterlist.refreshTimeoutId = 10000 as unknown as ReturnType<
			typeof setTimeout
		>;

		const onRequestItems = vi.fn(() => {
			callsSequence.push("onRequestItems");
		});

		filterlist.emitter.on(eventTypes.requestItems, onRequestItems);

		await filterlist.manualRequestItems(testListState);

		expect(onRequestItems).toHaveBeenCalledTimes(1);

		expect(clearTimeout).toHaveBeenCalledTimes(1);
	});

	test("clear refresh timeout after request", async () => {
		const testResponse = {
			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		const loadItems = vi.fn(() => {
			expect(clearTimeout).toHaveBeenCalledTimes(0);

			filterlist.refreshTimeoutId = 10000 as unknown as ReturnType<
				typeof setTimeout
			>;

			callsSequence.push("itemsLoader");

			return testResponse;
		});

		const filterlist = new ManualFilterlist({
			...defaultParams,
			loadItems,
		});

		const onRequestItems = vi.fn(() => {
			callsSequence.push("onRequestItems");
		});

		filterlist.emitter.on(eventTypes.requestItems, onRequestItems);

		await filterlist.manualRequestItems(testListState);

		expect(onRequestItems).toHaveBeenCalledTimes(1);

		expect(clearTimeout).toHaveBeenCalledTimes(1);
		expect(clearTimeout).toHaveBeenCalledWith(10000);
	});

	test("not set refresh timeout after request if `requestTimeout` is not provided", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const onRequestItems = vi.fn(() => {
			callsSequence.push("onRequestItems");
		});

		filterlist.emitter.on(eventTypes.requestItems, onRequestItems);

		await filterlist.manualRequestItems(testListState);

		expect(onRequestItems).toHaveBeenCalledTimes(1);

		expect(setTimeout).toHaveBeenCalledTimes(0);
	});

	test("set refresh timeout after request if `requestTimeout` is provided", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
			refreshTimeout: 5000,
		});

		vi.mocked(setTimeout).mockReturnValue(
			10000 as unknown as ReturnType<typeof setTimeout>,
		);

		const onRequestItems = vi.fn(() => {
			callsSequence.push("onRequestItems");
		});

		filterlist.emitter.on(eventTypes.requestItems, onRequestItems);

		await filterlist.manualRequestItems(testListState);

		expect(onRequestItems).toHaveBeenCalledTimes(1);

		expect(filterlist.refreshTimeoutId).toBe(10000);

		expect(setTimeout).toHaveBeenCalledTimes(1);
		expect(vi.mocked(setTimeout).mock.calls[0][1]).toBe(5000);

		filterlist.reload = vi.fn();

		vi.mocked(setTimeout).mock.calls[0][0]();

		expect(filterlist.reload).toHaveBeenCalledTimes(1);
	});

	test("should request items successfully", async () => {
		const testResponse = {
			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		const loadItems = vi.fn(() => {
			callsSequence.push("itemsLoader");

			return testResponse;
		});

		const filterlist = new ManualFilterlist({
			...defaultParams,

			loadItems,
		});

		const onRequestItems = vi.fn(() => {
			callsSequence.push("onRequestItems");
		});

		const prevState = filterlist.getListState();

		filterlist.emitter.on(eventTypes.requestItems, onRequestItems);
		filterlist.requestId = 3;

		await filterlist.manualRequestItems(prevState);

		expect(onRequestItems).toHaveBeenCalledTimes(1);
		expect(onRequestItems).toHaveBeenCalledWith(prevState);

		expect(onSuccessMethod).toHaveBeenCalledTimes(1);
		expect(onSuccessMethod).toHaveBeenCalledWith(testResponse);

		expect(filterlist.requestId).toBe(4);

		expect(callsSequence).toEqual([
			"onInit",
			"onRequestItems",
			"itemsLoader",
			"onSuccess",
		]);
	});

	test("should request items with error", async () => {
		const testError = {
			error: "error",

			additional: {
				count: 3,
			},
		};

		const loadItems = vi.fn(() => {
			callsSequence.push("itemsLoader");

			throw new LoadListError(testError);
		});

		const filterlist = new ManualFilterlist({
			...defaultParams,

			loadItems,
		});

		const onRequestItems = vi.fn(() => {
			callsSequence.push("onRequestItems");
		});

		const prevState = filterlist.getListState();

		filterlist.emitter.on(eventTypes.requestItems, onRequestItems);
		filterlist.requestId = 3;

		await filterlist.manualRequestItems(prevState);

		expect(onRequestItems).toHaveBeenCalledTimes(1);
		expect(onRequestItems).toHaveBeenCalledWith(prevState);

		expect(onErrorMethod).toHaveBeenCalledTimes(1);
		expect(onErrorMethod.mock.calls[0][0]).toHaveProperty(
			"error",
			testError.error,
		);
		expect(onErrorMethod.mock.calls[0][0]).toHaveProperty(
			"additional",
			testError.additional,
		);

		expect(filterlist.requestId).toBe(4);

		expect(callsSequence).toEqual([
			"onInit",
			"onRequestItems",
			"itemsLoader",
			"onError",
		]);
	});

	test("should throw up not LoadListError", async () => {
		const loadItems = vi.fn(() => {
			callsSequence.push("itemsLoader");

			throw new Error("Other error");
		});

		const filterlist = new ManualFilterlist({
			...defaultParams,

			loadItems,
		});

		const onRequestItems = vi.fn(() => {
			callsSequence.push("onRequestItems");
		});

		const prevState = filterlist.getListState();

		filterlist.emitter.on(eventTypes.requestItems, onRequestItems);
		filterlist.requestId = 3;

		let hasError = false;

		try {
			await filterlist.manualRequestItems(prevState);
		} catch (e) {
			hasError = true;
		}

		expect(hasError).toBe(true);

		expect(onRequestItems).toHaveBeenCalledTimes(1);
		expect(onRequestItems).toHaveBeenCalledWith(prevState);

		expect(onSuccessMethod).toHaveBeenCalledTimes(0);
		expect(onErrorMethod).toHaveBeenCalledTimes(0);

		expect(filterlist.requestId).toBe(4);

		expect(callsSequence).toEqual(["onInit", "onRequestItems", "itemsLoader"]);
	});

	test("should ingore success response if requestId increased in process of loadItems", async () => {
		const testResponse = {
			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		let filterlist: ManualFilterlist<
			number,
			{ count: number },
			unknown
		> | null = null;

		const loadItems = vi.fn(() => {
			if (!filterlist) {
				throw new Error("filterlist is not initialized");
			}

			filterlist.requestId = 10;
			callsSequence.push("itemsLoader");

			return testResponse;
		});

		filterlist = new ManualFilterlist({
			...defaultParams,

			loadItems,
		});

		const onRequestItems = vi.fn(() => {
			callsSequence.push("onRequestItems");
		});

		const prevState = filterlist.getListState();

		filterlist.emitter.on(eventTypes.requestItems, onRequestItems);
		filterlist.requestId = 3;

		await filterlist.manualRequestItems(prevState);

		expect(onRequestItems).toHaveBeenCalledTimes(1);
		expect(onRequestItems).toHaveBeenCalledWith(prevState);

		expect(onSuccessMethod).toHaveBeenCalledTimes(0);
		expect(onErrorMethod).toHaveBeenCalledTimes(0);

		expect(filterlist.requestId).toBe(10);

		expect(callsSequence).toEqual(["onInit", "onRequestItems", "itemsLoader"]);
	});

	test("should ingore LoadListError if requestId increased in process of loadItems", async () => {
		const testError = {
			error: "error",

			additional: {
				count: 3,
			},
		};

		let filterlist: ManualFilterlist<
			number,
			{ count: number },
			unknown
		> | null = null;

		const loadItems = vi.fn(() => {
			if (!filterlist) {
				throw new Error("filterlist is not initialized");
			}

			filterlist.requestId = 10;
			callsSequence.push("itemsLoader");

			throw new LoadListError(testError);
		});

		filterlist = new ManualFilterlist({
			...defaultParams,

			loadItems,
		});

		const onRequestItems = vi.fn(() => {
			callsSequence.push("onRequestItems");
		});

		const prevState = filterlist.getListState();

		filterlist.emitter.on(eventTypes.requestItems, onRequestItems);
		filterlist.requestId = 3;

		await filterlist.manualRequestItems(prevState);

		expect(onRequestItems).toHaveBeenCalledTimes(1);
		expect(onRequestItems).toHaveBeenCalledWith(prevState);

		expect(onSuccessMethod).toHaveBeenCalledTimes(0);
		expect(onErrorMethod).toHaveBeenCalledTimes(0);

		expect(filterlist.requestId).toBe(10);

		expect(callsSequence).toEqual(["onInit", "onRequestItems", "itemsLoader"]);
	});
});

describe("onSuccess", () => {
	test("should append items", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const prevState = filterlist.getListState();

		filterlist.listState = {
			...prevState,
			loading: true,
			items: [1, 2, 3],
			loadedPages: 2,
		};

		filterlist.manualOnSuccess({
			items: [4, 5, 6],
		});

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		expect(filterlist.listState.loading).toBe(false);
		expect(filterlist.listState.isFirstLoad).toBe(false);
		expect(filterlist.listState.items).toEqual([1, 2, 3, 4, 5, 6]);
		expect(filterlist.listState.loadedPages).toBe(3);
	});

	test("should replace items", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			saveItemsWhileLoad: true,
		});

		const prevState = filterlist.getListState();

		filterlist.listState = {
			...prevState,
			loading: true,
			shouldClean: true,
			items: [1, 2, 3],
			loadedPages: 2,
		};

		filterlist.manualOnSuccess({
			items: [4, 5, 6],
		});

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		expect(filterlist.listState.loading).toBe(false);
		expect(filterlist.listState.isFirstLoad).toBe(false);
		expect(filterlist.listState.shouldClean).toBe(false);
		expect(filterlist.listState.items).toEqual([4, 5, 6]);
		expect(filterlist.listState.loadedPages).toBe(1);
	});

	test("should update additional", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const prevState = filterlist.getListState();

		filterlist.listState = {
			...prevState,
			loading: true,
			additional: {
				test: "value1",
			},
		};

		filterlist.manualOnSuccess({
			items: [],
			additional: {
				test: "value2",
			},
		});

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		expect(filterlist.listState.loading).toBe(false);
		expect(filterlist.listState.isFirstLoad).toBe(false);
		expect(filterlist.listState.additional).toEqual({
			test: "value2",
		});
	});

	test("should update additional with falsy value", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const prevState = filterlist.getListState();

		filterlist.listState = {
			...prevState,
			loading: true,
			additional: {
				test: "value1",
			},
		};

		filterlist.manualOnSuccess({
			items: [],
			additional: null,
		});

		expect(filterlist.listState.loading).toBe(false);
		expect(filterlist.listState.isFirstLoad).toBe(false);
		expect(filterlist.listState.additional).toBe(null);
	});

	test("should not update additional", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const prevState = filterlist.getListState();

		filterlist.listState = {
			...prevState,
			loading: true,
			additional: {
				test: "value1",
			},
		};

		filterlist.manualOnSuccess({
			items: [],
		});

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		expect(filterlist.listState.loading).toBe(false);
		expect(filterlist.listState.isFirstLoad).toBe(false);
		expect(filterlist.listState.additional).toEqual({
			test: "value1",
		});
	});

	test("should update total", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const prevState = filterlist.getListState();

		filterlist.listState = {
			...prevState,
			loading: true,
			total: 5,
		};

		filterlist.manualOnSuccess({
			items: [],
			total: 10,
		});

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		expect(filterlist.listState.loading).toBe(false);
		expect(filterlist.listState.isFirstLoad).toBe(false);
		expect(filterlist.listState.total).toEqual(10);
	});

	test("should not update total", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const prevState = filterlist.getListState();

		filterlist.listState = {
			...prevState,
			loading: true,
			total: 5,
		};

		filterlist.manualOnSuccess({
			items: [],
		});

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		expect(filterlist.listState.loading).toBe(false);
		expect(filterlist.listState.isFirstLoad).toBe(false);
		expect(filterlist.listState.total).toEqual(5);
	});
});

describe("onError", () => {
	test("should set error and additional", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const prevState = filterlist.getListState();

		filterlist.listState = {
			...prevState,
			loading: true,
			shouldClean: true,
			error: "error1",
			additional: "additional1",
		};

		filterlist.manualOnError(
			new LoadListError({
				error: "error2",
				additional: "additional2",
			}),
		);

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		expect(filterlist.listState.loading).toBe(false);
		expect(filterlist.listState.isFirstLoad).toBe(true);
		expect(filterlist.listState.shouldClean).toBe(false);
		expect(filterlist.listState.error).toBe("error2");
		expect(filterlist.listState.additional).toBe("additional2");
	});

	test("should set only error", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const prevState = filterlist.getListState();

		filterlist.listState = {
			...prevState,
			loading: true,
			shouldClean: true,
			error: "error1",
			additional: "additional1",
		};

		filterlist.manualOnError(
			new LoadListError({
				error: "error2",
			}),
		);

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		expect(filterlist.listState.loading).toBe(false);
		expect(filterlist.listState.isFirstLoad).toBe(true);
		expect(filterlist.listState.shouldClean).toBe(false);
		expect(filterlist.listState.error).toBe("error2");
		expect(filterlist.listState.additional).toBe("additional1");
	});

	test("should set only additional and null as error", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const prevState = filterlist.getListState();

		filterlist.listState = {
			...prevState,
			loading: true,
			shouldClean: true,
			error: "error1",
			additional: "additional1",
		};

		filterlist.manualOnError(
			new LoadListError({
				additional: "additional2",
			}),
		);

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		expect(filterlist.listState.loading).toBe(false);
		expect(filterlist.listState.isFirstLoad).toBe(true);
		expect(filterlist.listState.shouldClean).toBe(false);
		expect(filterlist.listState.error).toBe(null);
		expect(filterlist.listState.additional).toBe("additional2");
	});

	test("should update total", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const prevState = filterlist.getListState();

		filterlist.listState = {
			...prevState,
			loading: true,
			shouldClean: true,
			error: "error1",
			total: 5,
		};

		filterlist.manualOnError(
			new LoadListError({
				total: 10,
			}),
		);

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		expect(filterlist.listState.loading).toBe(false);
		expect(filterlist.listState.isFirstLoad).toBe(true);
		expect(filterlist.listState.shouldClean).toBe(false);
		expect(filterlist.listState.error).toBe(null);
		expect(filterlist.listState.total).toBe(10);
	});

	test("should not update total", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const prevState = filterlist.getListState();

		filterlist.listState = {
			...prevState,
			loading: true,
			shouldClean: true,
			error: "error1",
			total: 5,
		};

		filterlist.manualOnError(new LoadListError({}));

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		expect(filterlist.listState.loading).toBe(false);
		expect(filterlist.listState.isFirstLoad).toBe(true);
		expect(filterlist.listState.shouldClean).toBe(false);
		expect(filterlist.listState.error).toBe(null);
		expect(filterlist.listState.total).toBe(5);
	});
});

describe("getListStateBeforeReload", () => {
	test("should reset previous items", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			alwaysResetFilters: {
				test2: "value2_3",
			},
		});

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
			},

			items: [1, 2, 3],
			loadedPages: 2,

			error: "error",

			additional: {
				count: 3,
			},

			page: 3,
		};

		filterlist.listState = nextState;

		const expectedState = {
			...nextState,

			items: [],
			loadedPages: 0,
			error: null,
			loading: true,
			shouldClean: true,
			page: 1,
		};

		expect(filterlist.getListStateBeforeReload()).toEqual(expectedState);
	});

	test("should save previous items", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			saveItemsWhileLoad: true,

			alwaysResetFilters: {
				test2: "value2_3",
			},
		});

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
			},

			items: [1, 2, 3],
			loadedPages: 2,

			error: "error",

			additional: {
				count: 3,
			},

			page: 3,
		};

		filterlist.listState = nextState;

		const expectedState = {
			...nextState,

			items: [1, 2, 3],
			loadedPages: 2,

			error: null,
			loading: true,
			shouldClean: true,
			page: 1,
		};

		expect(filterlist.getListStateBeforeReload()).toEqual(expectedState);
	});
});

describe("getListStateBeforeChange", () => {
	test("should reset previous items", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			alwaysResetFilters: {
				test2: "value2_3",
			},
		});

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
			},

			items: [1, 2, 3],
			loadedPages: 2,

			error: "error",

			additional: {
				count: 3,
			},

			page: 3,
		};

		filterlist.listState = nextState;

		const expectedState = {
			...nextState,

			filters: {
				...nextState.filters,
				test2: "value2_3",
			},

			appliedFilters: {
				...nextState.appliedFilters,
				test2: "value2_3",
			},

			items: [],
			loadedPages: 0,
			error: null,
			loading: true,
			shouldClean: true,
			page: 1,
		};

		expect(filterlist.getListStateBeforeChange()).toEqual(expectedState);
	});

	test("should save previous items", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			saveItemsWhileLoad: true,

			alwaysResetFilters: {
				test2: "value2_3",
			},
		});

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
			},

			items: [1, 2, 3],
			loadedPages: 2,

			error: "error",

			additional: {
				count: 3,
			},

			page: 3,
		};

		filterlist.listState = nextState;

		const expectedState = {
			...nextState,

			filters: {
				...nextState.filters,
				test2: "value2_3",
			},

			appliedFilters: {
				...nextState.appliedFilters,
				test2: "value2_3",
			},

			items: [1, 2, 3],
			loadedPages: 2,

			error: null,
			loading: true,
			shouldClean: true,
			page: 1,
		};

		expect(filterlist.getListStateBeforeChange()).toEqual(expectedState);
	});
});

describe("public methods", () => {
	test("should load more items", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const onLoadItems = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.loadMore, onLoadItems);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
			},

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		await filterlist.loadMore();

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...nextState,

			loading: true,
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onLoadItems).toHaveBeenCalledTimes(1);
		expect(onLoadItems.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should set filter value", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const onSetFilterValue = vi.fn();

		filterlist.emitter.on(eventTypes.setFilterValue, onSetFilterValue);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1",
				test2: "value2",
			},

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		filterlist.setFilterValue("test2", "value3");

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...nextState,

			filters: {
				...nextState.filters,
				test2: "value3",
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onSetFilterValue).toHaveBeenCalledTimes(1);
		expect(onSetFilterValue.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(0);
	});

	test("should apply filter", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const onApplyFilter = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.applyFilter, onApplyFilter);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
			},

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.applyFilter("test2");

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,

			appliedFilters: {
				...listStateBeforeChange.appliedFilters,
				test2: "value2_1",
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onApplyFilter).toHaveBeenCalledTimes(1);
		expect(onApplyFilter.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should set and apply filter", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const onSetAndApplyFilter = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.setAndApplyFilter, onSetAndApplyFilter);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
			},

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.setAndApplyFilter("test2", "value2_3");

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,

			filters: {
				...listStateBeforeChange.filters,
				test2: "value2_3",
			},

			appliedFilters: {
				...listStateBeforeChange.appliedFilters,
				test2: "value2_3",
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onSetAndApplyFilter).toHaveBeenCalledTimes(1);
		expect(onSetAndApplyFilter.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should reset filter", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			resetFiltersTo: {
				test2: "value2_3",
			},
		});

		const onResetFilter = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.resetFilter, onResetFilter);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
			},

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.resetFilter("test2");

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,

			filters: {
				...listStateBeforeChange.filters,
				test2: "value2_3",
			},

			appliedFilters: {
				...listStateBeforeChange.appliedFilters,
				test2: "value2_3",
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onResetFilter).toHaveBeenCalledTimes(1);
		expect(onResetFilter.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should set values of multiple filters", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const onSetFiltersValues = vi.fn();

		filterlist.emitter.on(eventTypes.setFiltersValues, onSetFiltersValues);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1",
				test2: "value2",
			},

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		filterlist.setFiltersValues({
			test2: "value3",
			test3: "value4",
		});

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...nextState,

			filters: {
				...nextState.filters,
				test2: "value3",
				test3: "value4",
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onSetFiltersValues).toHaveBeenCalledTimes(1);
		expect(onSetFiltersValues.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(0);
	});

	test("should apply multiple filters", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const onApplyFilters = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.applyFilters, onApplyFilters);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
				test3: "value3_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
				test3: "value3_2",
			},

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.applyFilters(["test2", "test3"]);

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,

			appliedFilters: {
				...listStateBeforeChange.appliedFilters,
				test2: "value2_1",
				test3: "value3_1",
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onApplyFilters).toHaveBeenCalledTimes(1);
		expect(onApplyFilters.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should set and apply multiple filters", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const onSetAndApplyFilters = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.setAndApplyFilters, onSetAndApplyFilters);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
			},

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.setAndApplyFilters({
			test2: "value2_3",
			test3: "value3_3",
		});

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,

			filters: {
				...listStateBeforeChange.filters,
				test2: "value2_3",
				test3: "value3_3",
			},

			appliedFilters: {
				...listStateBeforeChange.appliedFilters,
				test2: "value2_3",
				test3: "value3_3",
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onSetAndApplyFilters).toHaveBeenCalledTimes(1);
		expect(onSetAndApplyFilters.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should change page", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const onSetPage = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.setPage, onSetPage);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
			},

			items: [1, 2, 3],

			additional: {
				count: 3,
			},

			page: 3,
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.setPage(5);

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,
			page: 5,
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onSetPage).toHaveBeenCalledTimes(1);
		expect(onSetPage.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should change page size", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		const onSetPageSize = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.setPageSize, onSetPageSize);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
			},

			items: [1, 2, 3],

			additional: {
				count: 3,
			},

			pageSize: 20,
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.setPageSize(30);

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,
			pageSize: 30,
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onSetPageSize).toHaveBeenCalledTimes(1);
		expect(onSetPageSize.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should reset multiple filters", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			resetFiltersTo: {
				test2: "value2_3",
				test3: "value3_3",
			},
		});

		const onResetFilters = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.resetFilters, onResetFilters);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
				test3: "value3_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
				test3: "value3_2",
			},

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.resetFilters(["test2", "test3"]);

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,

			filters: {
				...listStateBeforeChange.filters,
				test2: "value2_3",
				test3: "value3_3",
			},

			appliedFilters: {
				...listStateBeforeChange.appliedFilters,
				test2: "value2_3",
				test3: "value3_3",
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onResetFilters).toHaveBeenCalledTimes(1);
		expect(onResetFilters.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should reset all filters", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			resetFiltersTo: {
				test1: "value1_3",
				test2: "value2_3",
				test3: "value3_3",
			},

			saveFiltersOnResetAll: ["test1", "test3"],
		});

		const onResetAllFilters = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.resetAllFilters, onResetAllFilters);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
				test3: "value3_1",
				test4: "value4_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
				test3: "value3_2",
				test4: "value4_2",
			},

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.resetAllFilters();

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,

			filters: {
				test1: "value1_1",
				test2: "value2_3",
				test3: "value3_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_3",
				test3: "value3_2",
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onResetAllFilters).toHaveBeenCalledTimes(1);
		expect(onResetAllFilters.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should set sorting with asc is isDefaultSortAsc (false)", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			isDefaultSortAsc: false,
		});

		const onSetSorting = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.setSorting, onSetSorting);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.setSorting("sortParam");

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,

			sort: {
				param: "sortParam",
				asc: false,
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onSetSorting).toHaveBeenCalledTimes(1);
		expect(onSetSorting.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should set sorting with asc is isDefaultSortAsc (true)", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			isDefaultSortAsc: true,
		});

		const onSetSorting = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.setSorting, onSetSorting);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.setSorting("sortParam");

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,

			sort: {
				param: "sortParam",
				asc: true,
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onSetSorting).toHaveBeenCalledTimes(1);
		expect(onSetSorting.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should change sort asc", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			isDefaultSortAsc: true,

			sort: {
				param: "sortParam",
				asc: true,
			},
		});

		const onSetSorting = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.setSorting, onSetSorting);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.setSorting("sortParam");

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,

			sort: {
				param: "sortParam",
				asc: false,
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onSetSorting).toHaveBeenCalledTimes(1);
		expect(onSetSorting.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should set sorting with asc from arguments", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			isDefaultSortAsc: false,
		});

		const onSetSorting = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.setSorting, onSetSorting);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.setSorting("sortParam", true);

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,

			sort: {
				param: "sortParam",
				asc: true,
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onSetSorting).toHaveBeenCalledTimes(1);
		expect(onSetSorting.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should reset sorting with asc is isDefaultSortAsc (false)", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			isDefaultSortAsc: false,

			sort: {
				param: "sortParam",
				asc: true,
			},
		});

		const onResetSorting = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.resetSorting, onResetSorting);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.resetSorting();

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,

			sort: {
				param: null,
				asc: false,
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onResetSorting).toHaveBeenCalledTimes(1);
		expect(onResetSorting.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should reset sorting with asc is isDefaultSortAsc (true)", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			isDefaultSortAsc: true,

			sort: {
				param: "sortParam",
				asc: false,
			},
		});

		const onResetSorting = vi.fn();
		const onChangeLoadParams = vi.fn();

		filterlist.emitter.on(eventTypes.resetSorting, onResetSorting);
		filterlist.emitter.on(eventTypes.changeLoadParams, onChangeLoadParams);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			items: [1, 2, 3],

			additional: {
				count: 3,
			},
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.resetSorting();

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,

			sort: {
				param: null,
				asc: true,
			},
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onResetSorting).toHaveBeenCalledTimes(1);
		expect(onResetSorting.mock.calls[0][0]).toEqual(expectedListState);

		expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
		expect(onChangeLoadParams.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should update state and request", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			sort: {
				param: "testParam1",
				asc: false,
			},
		});

		const onSetFiltersAndSorting = vi.fn();

		filterlist.emitter.on(
			eventTypes.updateStateAndRequest,
			onSetFiltersAndSorting,
		);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
				test3: "value3_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
				test3: "value3_2",
			},

			items: [1, 2, 3],

			additional: {
				count: 3,
			},

			page: 3,
			pageSize: 20,
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.updateStateAndRequest({
			filters: {
				test1: "value1_3",
				test2: "value2_3",
			},

			appliedFilters: {
				test1: "value1_4",
				test2: "value2_4",
			},

			sort: {
				param: "testParam2",
				asc: true,
			},

			page: 5,
			pageSize: 30,
		});

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = {
			...listStateBeforeChange,

			filters: {
				test1: "value1_3",
				test2: "value2_3",
			},

			appliedFilters: {
				test1: "value1_4",
				test2: "value2_4",
			},

			sort: {
				param: "testParam2",
				asc: true,
			},

			page: 5,
			pageSize: 30,
		};

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onSetFiltersAndSorting).toHaveBeenCalledTimes(1);
		expect(onSetFiltersAndSorting.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should not change filters and sorting with updateStateAndRequest", async () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			sort: {
				param: "testParam1",
				asc: false,
			},
		});

		const onSetFiltersAndSorting = vi.fn();

		filterlist.emitter.on(
			eventTypes.updateStateAndRequest,
			onSetFiltersAndSorting,
		);

		const prevState = filterlist.getListState();

		const nextState = {
			...prevState,

			filters: {
				test1: "value1_1",
				test2: "value2_1",
				test3: "value3_1",
			},

			appliedFilters: {
				test1: "value1_2",
				test2: "value2_2",
				test3: "value3_2",
			},

			items: [1, 2, 3],

			additional: {
				count: 3,
			},

			page: 3,
			pageSize: 20,
		};

		filterlist.listState = nextState;

		const listStateBeforeChange = filterlist.getListStateBeforeChange();

		await filterlist.updateStateAndRequest({
			filters: undefined,
			appliedFilters: undefined,
			sort: undefined,
			page: undefined,
			pageSize: undefined,
		});

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const expectedListState = listStateBeforeChange;

		expect(filterlist.listState).toEqual(expectedListState);

		expect(onSetFiltersAndSorting).toHaveBeenCalledTimes(1);
		expect(onSetFiltersAndSorting.mock.calls[0][0]).toEqual(expectedListState);

		expect(requestItemsMethod).toHaveBeenCalledTimes(1);
	});

	test("should insert item and not change additional", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			items: [
				{
					label: 1,
					value: 1,
				},
				{
					label: 2,
					value: 2,
				},
				{
					label: 3,
					value: 3,
				},
				{
					label: 4,
					value: 4,
				},
				{
					label: 5,
					value: 5,
				},
			],

			additional: {
				count: 5,
			},
		});

		filterlist.insertItem(2, {
			label: 6,
			value: 6,
		});

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const nextState = filterlist.getListState();

		expect(nextState.items).toEqual([
			{
				label: 1,
				value: 1,
			},
			{
				label: 2,
				value: 2,
			},
			{
				label: 6,
				value: 6,
			},
			{
				label: 3,
				value: 3,
			},
			{
				label: 4,
				value: 4,
			},
			{
				label: 5,
				value: 5,
			},
		]);

		expect(nextState.additional).toEqual({
			count: 5,
		});
	});

	test("should insert item and change additional", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			items: [
				{
					label: 1,
					value: 1,
				},
				{
					label: 2,
					value: 2,
				},
				{
					label: 3,
					value: 3,
				},
				{
					label: 4,
					value: 4,
				},
				{
					label: 5,
					value: 5,
				},
			],

			additional: {
				count: 5,
			},
		});

		filterlist.insertItem(
			2,
			{
				label: 6,
				value: 6,
			},
			{
				count: 6,
			},
		);

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const nextState = filterlist.getListState();

		expect(nextState.items).toEqual([
			{
				label: 1,
				value: 1,
			},
			{
				label: 2,
				value: 2,
			},
			{
				label: 6,
				value: 6,
			},
			{
				label: 3,
				value: 3,
			},
			{
				label: 4,
				value: 4,
			},
			{
				label: 5,
				value: 5,
			},
		]);

		expect(nextState.additional).toEqual({
			count: 6,
		});
	});

	test("should delete item and not change additional", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			items: [
				{
					label: 1,
					value: 1,
				},
				{
					label: 2,
					value: 2,
				},
				{
					label: 3,
					value: 3,
				},
				{
					label: 4,
					value: 4,
				},
				{
					label: 5,
					value: 5,
				},
			],

			additional: {
				count: 5,
			},
		});

		filterlist.deleteItem(2);

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const nextState = filterlist.getListState();

		expect(nextState.items).toEqual([
			{
				label: 1,
				value: 1,
			},
			{
				label: 2,
				value: 2,
			},
			{
				label: 4,
				value: 4,
			},
			{
				label: 5,
				value: 5,
			},
		]);

		expect(nextState.additional).toEqual({
			count: 5,
		});
	});

	test("should delete item and change additional", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			items: [
				{
					label: 1,
					value: 1,
				},
				{
					label: 2,
					value: 2,
				},
				{
					label: 3,
					value: 3,
				},
				{
					label: 4,
					value: 4,
				},
				{
					label: 5,
					value: 5,
				},
			],

			additional: {
				count: 5,
			},
		});

		filterlist.deleteItem(2, {
			count: 4,
		});

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const nextState = filterlist.getListState();

		expect(nextState.items).toEqual([
			{
				label: 1,
				value: 1,
			},
			{
				label: 2,
				value: 2,
			},
			{
				label: 4,
				value: 4,
			},
			{
				label: 5,
				value: 5,
			},
		]);

		expect(nextState.additional).toEqual({
			count: 4,
		});
	});

	test("should update item and not change additional", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			items: [
				{
					label: 1,
					value: 1,
				},
				{
					label: 2,
					value: 2,
				},
				{
					label: 3,
					value: 3,
				},
				{
					label: 4,
					value: 4,
				},
				{
					label: 5,
					value: 5,
				},
			],

			additional: {
				count: 5,
			},
		});

		filterlist.updateItem(2, {
			label: 10,
			value: 10,
		});

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const nextState = filterlist.getListState();

		expect(nextState.items).toEqual([
			{
				label: 1,
				value: 1,
			},
			{
				label: 2,
				value: 2,
			},
			{
				label: 10,
				value: 10,
			},
			{
				label: 4,
				value: 4,
			},
			{
				label: 5,
				value: 5,
			},
		]);

		expect(nextState.additional).toEqual({
			count: 5,
		});
	});

	test("set total number of pages", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			total: 5,
		});

		filterlist.setTotal(10);

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const nextState = filterlist.getListState();

		expect(nextState.total).toBe(10);
	});

	test("should update item and change additional", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,

			items: [
				{
					label: 1,
					value: 1,
				},
				{
					label: 2,
					value: 2,
				},
				{
					label: 3,
					value: 3,
				},
				{
					label: 4,
					value: 4,
				},
				{
					label: 5,
					value: 5,
				},
			],

			additional: {
				count: 5,
			},
		});

		filterlist.updateItem(
			2,
			{
				label: 10,
				value: 10,
			},
			{
				count: 4,
			},
		);

		expect(onChangeListStateMethod).toHaveBeenCalledTimes(1);

		const nextState = filterlist.getListState();

		expect(nextState.items).toEqual([
			{
				label: 1,
				value: 1,
			},
			{
				label: 2,
				value: 2,
			},
			{
				label: 10,
				value: 10,
			},
			{
				label: 4,
				value: 4,
			},
			{
				label: 5,
				value: 5,
			},
		]);

		expect(nextState.additional).toEqual({
			count: 4,
		});
	});
});

describe("destroy", () => {
	test("clear refresh timeout", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		filterlist.refreshTimeoutId = 10000 as unknown as ReturnType<
			typeof setTimeout
		>;

		filterlist.destroy();

		expect(clearTimeout).toHaveBeenCalledTimes(1);
		expect(clearTimeout).toHaveBeenCalledWith(
			10000 as unknown as ReturnType<typeof setTimeout>,
		);
	});

	test("clear subscriptions", () => {
		const filterlist = new ManualFilterlist({
			...defaultParams,
		});

		filterlist.emitter.on(eventTypes.setFilterValue, () => {});
		filterlist.destroy();

		expect([...filterlist.emitter.all].length).toBe(0);
	});
});
