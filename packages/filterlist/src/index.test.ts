import { expect, test } from "vitest";

import { Filterlist } from "./Filterlist";
import { collectListInitialState } from "./collectListInitialState";
import { collectOptions } from "./collectOptions";
import { LoadListError } from "./errors";
import * as eventTypes from "./eventTypes";
import { listInitialState } from "./listInitialState";

import * as lib from "./index";

test("should export needed modules", () => {
	expect(lib.Filterlist).toBe(Filterlist);
	expect(lib.eventTypes).toBe(eventTypes);
	expect(lib.collectListInitialState).toBe(collectListInitialState);
	expect(lib.collectOptions).toBe(collectOptions);
	expect(lib.listInitialState).toBe(listInitialState);
	expect(lib.LoadListError).toBe(LoadListError);
});
