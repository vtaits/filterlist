import { expect, test } from "bun:test";

import { arrayInsert } from "./arrayInsert";

test("should insert element to array", () => {
	expect(arrayInsert([1, 2, 3], 0, 4)).toEqual([4, 1, 2, 3]);
	expect(arrayInsert([1, 2, 3], 1, 4)).toEqual([1, 4, 2, 3]);
	expect(arrayInsert([1, 2, 3], 3, 4)).toEqual([1, 2, 3, 4]);
});
