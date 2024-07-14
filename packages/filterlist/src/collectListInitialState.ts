import { initialRequestParams } from "./initialRequestParams";
import { listInitialState as defaultListInitialState } from "./listInitialState";
import type { ListState, Params, RequestParams } from "./types";

export const collectListInitialState = <Item, Additional, Error>(
	params: Params<Item, Additional, Error>,
): [RequestParams, ListState<Item, Additional, Error>] => {
	const listInitialState = defaultListInitialState as ListState<
		Item,
		Additional,
		Error
	>;

	return [
		{
			...initialRequestParams,
			sort: params.sort || initialRequestParams.sort,
			appliedFilters:
				params.appliedFilters || initialRequestParams.appliedFilters,
			page: params.page || 1,
			pageSize: params.pageSize,
		},
		{
			...(listInitialState as ListState<Item, Additional, Error>),

			items: params.items || listInitialState.items,
			loadedPages:
				params.items && params.items.length > 0
					? 1
					: listInitialState.loadedPages,

			additional: Object.hasOwn(params, "additional")
				? (params.additional as Additional)
				: listInitialState.additional,

			total: params.total,
		},
	];
};
