import { expect, test } from "vitest";
import { Filterlist } from "./Filterlist";
import { collectListInitialState } from "./collectListInitialState";
import { collectOptions } from "./collectOptions";
import { LoadListError } from "./errors";
import * as lib from "./index";
import { initialRequestParams } from "./initialRequestParams";
import { listInitialState } from "./listInitialState";
import { LoadListAction } from "./types";

test("should export needed modules", () => {
	expect(lib.Filterlist).toBe(Filterlist);
	expect(lib.collectListInitialState).toBe(collectListInitialState);
	expect(lib.collectOptions).toBe(collectOptions);
	expect(lib.initialRequestParams).toBe(initialRequestParams);
	expect(lib.listInitialState).toBe(listInitialState);
	expect(lib.LoadListError).toBe(LoadListError);
	expect(lib.LoadListAction).toBe(LoadListAction);
});
