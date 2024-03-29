import type { ListState, Params } from "./types";

import { listInitialState as defaultListInitialState } from "./listInitialState";

export const collectListInitialState = <Item, Additional, Error>(
	params: Params<Item, Additional, Error>,
): ListState<Item, Additional, Error> => {
	const listInitialState = defaultListInitialState as ListState<
		Item,
		Additional,
		Error
	>;

	return {
		...(listInitialState as ListState<Item, Additional, Error>),

		items: params.items || listInitialState.items,
		loadedPages:
			params.items && params.items.length > 0
				? 1
				: listInitialState.loadedPages,

		sort: params.sort || listInitialState.sort,

		// biome-ignore lint/suspicious/noPrototypeBuiltins: `additional` can be `undefined`
		additional: params.hasOwnProperty("additional")
			? (params.additional as Additional)
			: listInitialState.additional,

		filters: params.appliedFilters || listInitialState.filters,

		appliedFilters: params.appliedFilters || listInitialState.appliedFilters,

		page: params.page || 1,
		pageSize: params.pageSize,
		total: params.total,
	};
};
