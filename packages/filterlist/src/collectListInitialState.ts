import { initialRequestParams } from "./initialRequestParams";
import { listInitialState as defaultListInitialState } from "./listInitialState";
import type { ListState, Params, RequestParams } from "./types";

function getInitialPageSize<Item, Additional, Error>({
	pageSize,
	pageSizeLocalStorageKey,
}: Params<Item, Additional, Error>) {
	if (pageSizeLocalStorageKey) {
		const pageSizeStr = localStorage.getItem(pageSizeLocalStorageKey);

		if (pageSizeStr) {
			const parsedPageSize = parseInt(pageSizeStr, 10);

			if (!Number.isNaN(parsedPageSize) && parsedPageSize > 0) {
				return parsedPageSize;
			}

			localStorage.removeItem(pageSizeLocalStorageKey);
		}
	}

	return pageSize;
}

export function collectListInitialState<Item, Additional, Error>(
	params: Params<Item, Additional, Error>,
): [RequestParams, ListState<Item, Additional, Error>] {
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
			pageSize: getInitialPageSize(params),
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
}
