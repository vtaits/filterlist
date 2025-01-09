import { describe, expect, mock, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import {
	type Filterlist,
	initialRequestParams,
	listInitialState,
} from "@vtaits/filterlist";
import { useFilter } from "./useFilter";

describe("not inited", () => {
	const {
		result: { current: filter },
	} = renderHook(() => useFilter(null, null, null, "test"));

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
		expect(filter.value).toBe(null);
	});

	test("appliedValue", () => {
		expect(filter.appliedValue).toBe(null);
	});
});

describe("inited", () => {
	const filterlist = {
		setFilterValue: mock(),
		setAndApplyFilter: mock(),
		applyFilter: mock(),
		resetFilter: mock(),
	} as unknown as Filterlist<unknown, unknown, unknown>;

	const {
		result: { current: filter },
	} = renderHook(() =>
		useFilter(
			{
				...initialRequestParams,
				appliedFilters: {
					test: "baz",
				},
			},
			{
				...listInitialState,
				filters: {
					test: "bar",
				},
			},
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
		expect(filter.value).toBe("bar");
	});

	test("appliedValue", () => {
		expect(filter.appliedValue).toBe("baz");
	});
});
