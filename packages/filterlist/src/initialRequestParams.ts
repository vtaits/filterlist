import type { RequestParams } from "./types";

export const initialRequestParams: RequestParams = {
	sort: {
		param: null,
		asc: true,
	},
	appliedFilters: {},
	page: 1,
};
