import { expect, test } from "bun:test";

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

test("should set isDefaultSortAsc true", () => {
	const options = collectOptions({
		...defaultParams,
		isDefaultSortAsc: true,
	});

	expect(options.isDefaultSortAsc).toEqual(true);
});

test("should set isDefaultSortAsc false", () => {
	const options = collectOptions({
		...defaultParams,
		isDefaultSortAsc: true,
	});

	expect(options.isDefaultSortAsc).toEqual(true);
});

test("should no set isDefaultSortAsc (true by default)", () => {
	const options = collectOptions(defaultParams);

	expect(options.isDefaultSortAsc).toEqual(true);
});

test("should set saveFiltersOnResetAll", () => {
	const options = collectOptions({
		...defaultParams,
		saveFiltersOnResetAll: ["filter1", "filter2"],
	});

	expect(options.saveFiltersOnResetAll).toEqual(["filter1", "filter2"]);
});

test("should set saveItemsWhileLoad", () => {
	const options = collectOptions({
		...defaultParams,
		saveItemsWhileLoad: true,
	});

	expect(options.saveItemsWhileLoad).toEqual(true);
});

test("should no set saveItemsWhileLoad (false by default)", () => {
	const options = collectOptions(defaultParams);

	expect(options.saveItemsWhileLoad).toEqual(false);
});

test("should set autoload", () => {
	const options = collectOptions({
		...defaultParams,
		autoload: false,
	});

	expect(options.autoload).toEqual(false);
});

test("should no set autoload (true by default)", () => {
	const options = collectOptions(defaultParams);

	expect(options.autoload).toEqual(true);
});
