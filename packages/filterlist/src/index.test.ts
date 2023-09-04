import { expect, test } from "vitest";

import { Filterlist } from "./Filterlist";
import * as eventTypes from "./eventTypes";
import { collectListInitialState } from "./collectListInitialState";
import { collectOptions } from "./collectOptions";
import { LoadListError } from "./errors";

import * as lib from "./index";

test("should export needed modules", () => {
	expect(lib.Filterlist).toBe(Filterlist);
	expect(lib.eventTypes).toBe(eventTypes);
	expect(lib.collectListInitialState).toBe(collectListInitialState);
	expect(lib.collectOptions).toBe(collectOptions);
	expect(lib.LoadListError).toBe(LoadListError);
});
