import { describe, expect, test } from "bun:test";

import { collectListInitialState } from "./collectListInitialState";
import { initialRequestParams } from "./initialRequestParams";
import { listInitialState } from "./listInitialState";
import type { ItemsLoaderResponse } from "./types";

const defaultParams = {
	loadItems: (): ItemsLoaderResponse<unknown, unknown> => ({
		items: [],
	}),
};

describe("collectListInitialState", () => {
	test("should return listInitialState", () => {
		expect(collectListInitialState(defaultParams)).toEqual([
			initialRequestParams,
			listInitialState,
		]);
	});

	test("should set initial sort", () => {
		const state = collectListInitialState({
			...defaultParams,

			sort: {
				param: "param",
				asc: false,
			},
		});

		expect(state[0].sort).toEqual({
			param: "param",
			asc: false,
		});
	});

	test("should set initial filters", () => {
		const filters = {
			filter1: "value1",
			filter2: "value2",
			filter3: ["value3", "value4"],
		};

		const state = collectListInitialState({
			...defaultParams,

			appliedFilters: filters,
		});

		expect(state[1].filters).toEqual({});
		expect(state[0].appliedFilters).toEqual(filters);
	});

	test("should set additional", () => {
		const state = collectListInitialState({
			...defaultParams,

			additional: {
				count: 0,
			},
		});

		expect(state[1].additional).toEqual({
			count: 0,
		});
	});

	test("should no set additional (null by default)", () => {
		const state = collectListInitialState({
			...defaultParams,
		});

		expect(state[1].additional).toEqual(null);
	});

	test("should set items", () => {
		const items = [1, 2, 3];

		const state = collectListInitialState({
			...defaultParams,
			items,
		});

		expect(state[1].items).toBe(items);
		expect(state[1].loadedPages).toBe(1);
	});

	test("should set page", () => {
		const page = 3;

		const state = collectListInitialState({
			...defaultParams,
			page,
		});

		expect(state[0].page).toBe(page);
	});

	describe("pageSize", () => {
		test("set from params if the local storage key is not defined", () => {
			const pageSize = 20;

			const state = collectListInitialState({
				...defaultParams,
				pageSize,
			});

			expect(state[0].pageSize).toBe(pageSize);
		});

		test("set from params if the local storage key is defined", () => {
			const pageSize = 20;

			const state = collectListInitialState({
				...defaultParams,
				pageSize,
				pageSizeLocalStorageKey: "test",
			});

			expect(state[0].pageSize).toBe(pageSize);
		});

		test("set from params if the local storage value is not a number", () => {
			const pageSize = 20;

			localStorage.setItem("test", "not_a_number");

			const state = collectListInitialState({
				...defaultParams,
				pageSize,
				pageSizeLocalStorageKey: "test",
			});

			expect(localStorage.getItem("test")).toBeFalsy();
			expect(state[0].pageSize).toBe(pageSize);
		});

		test("set from params if the local storage value is not a positive number", () => {
			const pageSize = 20;

			localStorage.setItem("test", "-5");

			const state = collectListInitialState({
				...defaultParams,
				pageSize,
				pageSizeLocalStorageKey: "test",
			});

			expect(localStorage.getItem("test")).toBeFalsy();
			expect(state[0].pageSize).toBe(pageSize);
		});

		test("set from local storage", () => {
			const pageSize = 20;

			localStorage.setItem("test", "50");

			const state = collectListInitialState({
				...defaultParams,
				pageSize,
				pageSizeLocalStorageKey: "test",
			});

			expect(state[0].pageSize).toBe(50);
		});
	});

	test("should set total", () => {
		const total = 3;

		const state = collectListInitialState({
			...defaultParams,
			total,
		});

		expect(state[1].total).toBe(total);
	});
});
