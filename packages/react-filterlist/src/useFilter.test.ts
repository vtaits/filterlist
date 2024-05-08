import { type Filterlist, listInitialState } from "@vtaits/filterlist";
import { useCallback, useMemo } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useFilter } from "./useFilter";

vi.mock("react");
vi.mocked(useCallback).mockImplementation((fn) => fn);
vi.mocked(useMemo).mockImplementation((fn) => fn());

afterEach(() => {
	vi.clearAllMocks();
});

describe("not inited", () => {
	const filter = useFilter(null, null, "test");

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
		setFilterValue: vi.fn(),
		setAndApplyFilter: vi.fn(),
		applyFilter: vi.fn(),
		resetFilter: vi.fn(),
	} as unknown as Filterlist<unknown, unknown, unknown>;

	const filter = useFilter(
		{
			...listInitialState,
			filters: {
				test: "bar",
			},
			appliedFilters: {
				test: "baz",
			},
		},
		filterlist,
		"test",
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
