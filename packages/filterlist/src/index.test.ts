import { expect, test } from "vitest";
import { Filterlist } from "./Filterlist";
import { collectListInitialState } from "./collectListInitialState";
import { collectOptions } from "./collectOptions";
import { LoadListError } from "./errors";
import * as lib from "./index";
import { listInitialState } from "./listInitialState";
import { EventType } from "./types";

test("should export needed modules", () => {
	expect(lib.Filterlist).toBe(Filterlist);
	expect(lib.EventType).toBe(EventType);
	expect(lib.collectListInitialState).toBe(collectListInitialState);
	expect(lib.collectOptions).toBe(collectOptions);
	expect(lib.listInitialState).toBe(listInitialState);
	expect(lib.LoadListError).toBe(LoadListError);
});
