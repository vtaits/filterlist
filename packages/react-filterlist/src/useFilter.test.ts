import { renderHook } from "@testing-library/react";
import {
	type Filterlist,
	type ListState,
	type RequestParams,
	initialRequestParams,
	listInitialState,
} from "@vtaits/filterlist";
import { Signal } from "signal-polyfill";
import { describe, expect, test, vi } from "vitest";
import { useFilter } from "./useFilter";

describe("not inited", () => {
	const {
		result: { current: filter },
	} = renderHook(() =>
		useFilter(
			new Signal.Computed<RequestParams | null>(() => null),
			new Signal.Computed<ListState<unknown, unknown, unknown> | null>(
				() => null,
			),
			null,
			"test",
		),
	);

	test("setFilterValue", () => {
		filter.setFilterValue("foo");
	});

	test("setAndApplyFilter", () => {
		filter.setAndApplyFilter("foo");
	});

	test("applyFilter", () => {
		filter.applyFilter();
	});

	test("resetFilter", () => {
		filter.resetFilter();
	});

	test("value", () => {
		expect(filter.valueSignal.get()).toBe(null);
	});

	test("appliedValue", () => {
		expect(filter.appliedValueSignal.get()).toBe(null);
	});
});

describe("inited", () => {
	const filterlist = {
		setFilterValue: vi.fn(),
		setAndApplyFilter: vi.fn(),
		applyFilter: vi.fn(),
		resetFilter: vi.fn(),
	} as unknown as Filterlist<unknown, unknown, unknown>;

	const {
		result: { current: filter },
	} = renderHook(() =>
		useFilter(
			new Signal.Computed<RequestParams | null>(() => ({
				...initialRequestParams,
				appliedFilters: {
					test: "baz",
				},
			})),
			new Signal.Computed<ListState<unknown, unknown, unknown> | null>(() => ({
				...listInitialState,
				filters: {
					test: "bar",
				},
			})),
			filterlist,
			"test",
		),
	);

	test("setFilterValue", () => {
		filter.setFilterValue("foo");

		expect(filterlist.setFilterValue).toHaveBeenCalledTimes(1);
		expect(filterlist.setFilterValue).toHaveBeenCalledWith("test", "foo");
	});

	test("setAndApplyFilter", () => {
		filter.setAndApplyFilter("foo");

		expect(filterlist.setAndApplyFilter).toHaveBeenCalledTimes(1);
		expect(filterlist.setAndApplyFilter).toHaveBeenCalledWith("test", "foo");
	});

	test("applyFilter", () => {
		filter.applyFilter();

		expect(filterlist.applyFilter).toHaveBeenCalledTimes(1);
		expect(filterlist.applyFilter).toHaveBeenCalledWith("test");
	});

	test("resetFilter", () => {
		filter.resetFilter();

		expect(filterlist.resetFilter).toHaveBeenCalledTimes(1);
		expect(filterlist.resetFilter).toHaveBeenCalledWith("test");
	});

	test("value", () => {
		expect(filter.valueSignal.get()).toBe("bar");
	});

	test("appliedValue", () => {
		expect(filter.appliedValueSignal.get()).toBe("baz");
	});
});
