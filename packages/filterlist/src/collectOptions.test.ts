import { describe, expect, test } from "bun:test";

import { collectOptions, defaultOptions } from "./collectOptions";

import type { ItemsLoaderResponse } from "./types";

const defaultParams = {
	loadItems: (): ItemsLoaderResponse<unknown, unknown> => ({
		items: [],
	}),
};

test("should return defaultOptions", () => {
	expect(collectOptions(defaultParams)).toEqual(defaultOptions);
});

test("should set filters for resetting", () => {
	const alwaysResetFilters = {
		filter1: "value1",
		filter2: "value2",
	};

	const options = collectOptions({
		...defaultParams,
		alwaysResetFilters,
	});

	expect(options.alwaysResetFilters).toEqual(alwaysResetFilters);
});

describe("isDefaultSortAsc", () => {
	test("set true from params", () => {
		const options = collectOptions({
			...defaultParams,
			isDefaultSortAsc: true,
		});

		expect(options.isDefaultSortAsc).toBe(true);
	});

	test("set false from params", () => {
		const options = collectOptions({
			...defaultParams,
			isDefaultSortAsc: false,
		});

		expect(options.isDefaultSortAsc).toBe(false);
	});

	test("true by default", () => {
		const options = collectOptions(defaultParams);

		expect(options.isDefaultSortAsc).toBe(true);
	});
});

test("should set saveFiltersOnResetAll", () => {
	const options = collectOptions({
		...defaultParams,
		saveFiltersOnResetAll: ["filter1", "filter2"],
	});

	expect(options.saveFiltersOnResetAll).toEqual(["filter1", "filter2"]);
});

describe("saveItemsWhileLoad", () => {
	test("set from params", () => {
		const options = collectOptions({
			...defaultParams,
			saveItemsWhileLoad: true,
		});

		expect(options.saveItemsWhileLoad).toBe(true);
	});

	test("false by default", () => {
		const options = collectOptions(defaultParams);

		expect(options.saveItemsWhileLoad).toBe(false);
	});
});

describe("autoload", () => {
	test("set from params", () => {
		const options = collectOptions({
			...defaultParams,
			autoload: false,
		});

		expect(options.autoload).toBe(false);
	});

	test("true by default", () => {
		const options = collectOptions(defaultParams);

		expect(options.autoload).toBe(true);
	});
});

describe("pageSizeLocalStorageKey", () => {
	test("undefined by default", () => {
		const options = collectOptions(defaultParams);

		expect(options.pageSizeLocalStorageKey).toBe(undefined);
	});

	test("set from params", () => {
		const options = collectOptions({
			...defaultParams,
			pageSizeLocalStorageKey: "test",
		});

		expect(options.pageSizeLocalStorageKey).toBe("test");
	});

	test("map empty string to undefined", () => {
		const options = collectOptions({
			...defaultParams,
			pageSizeLocalStorageKey: "",
		});

		expect(options.pageSizeLocalStorageKey).toBe(undefined);
	});
});
