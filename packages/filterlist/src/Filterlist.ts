import mitt, { type Emitter } from "mitt";
import sleep from "sleep-promise";
import { arrayInsert } from "./arrayInsert";
import { collectListInitialState } from "./collectListInitialState";
import { collectOptions } from "./collectOptions";
import { LoadListError } from "./errors";
import {
	EventType,
	type ItemsLoader,
	type ItemsLoaderResponse,
	type ListState,
	type Options,
	type Params,
	type RequestParams,
	type ShouldRequest,
	type UpdateStateParams,
} from "./types";

export class Filterlist<Item, Additional, Error> {
	requestId: number;

	requestParams: RequestParams;

	listState: ListState<Item, Additional, Error>;

	options: Options;

	itemsLoader: ItemsLoader<Item, Additional, Error>;

	refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

	shouldRequest?: ShouldRequest<Item, Additional, Error>;

	emitter: Emitter<Record<EventType, ListState<Item, Additional, Error>>>;

	constructor(params: Params<Item, Additional, Error>) {
		this.emitter = mitt();

		const { loadItems, shouldRequest } = params;

		if (!loadItems) {
			throw new Error("loadItems is required");
		}

		if (typeof loadItems !== "function") {
			throw new Error("loadItems should be a function");
		}

		this.itemsLoader = loadItems;
		this.shouldRequest = shouldRequest;

		this.requestId = 0;

		const [requestParams, listState] = collectListInitialState(params);
		this.listState = listState;
		this.requestParams = requestParams;
		this.options = collectOptions(params);

		this.onInit();
	}

	destroy() {
		if (this.refreshTimeoutId) {
			clearTimeout(this.refreshTimeoutId);
			this.refreshTimeoutId = null;
		}

		this.emitter.all.clear();
	}

	getListStateBeforeReload(): ListState<Item, Additional, Error> {
		const prevListState = this.listState;

		const { saveItemsWhileLoad } = this.options;

		return {
			...prevListState,

			loading: true,
			error: null,

			items: saveItemsWhileLoad ? prevListState.items : [],
			loadedPages: saveItemsWhileLoad ? prevListState.loadedPages : 0,

			shouldClean: true,
		};
	}

	getRequestParamsBeforeChange(): RequestParams {
		const { alwaysResetFilters } = this.options;

		return {
			...this.requestParams,
			appliedFilters: {
				...this.requestParams.appliedFilters,
				...alwaysResetFilters,
			},
			page: 1,
		};
	}

	getListStateBeforeChange(): ListState<Item, Additional, Error> {
		const stateBeforeReload = this.getListStateBeforeReload();

		const { alwaysResetFilters } = this.options;

		return {
			...stateBeforeReload,

			filters: {
				...stateBeforeReload.filters,
				...alwaysResetFilters,
			},
		};
	}

	emitEvent(eventType: EventType): void {
		this.emitter.emit(eventType, this.listState);
	}

	onInit(): void {
		const { autoload } = this.options;

		if (autoload) {
			this.loadItemsOnInit();
		}
	}

	async loadItemsOnInit(): Promise<void> {
		const prevListState = this.listState;

		this.setListState({
			...prevListState,

			loading: true,
			error: null,
			shouldClean: false,
		});

		this.emitEvent(EventType.loadMore);

		await this.requestItems(prevListState);
	}

	/**
	 * load next pack of items next to the last item, can be used for infinite scroll realization
	 */
	async loadMore(): Promise<void> {
		const prevListState = this.listState;

		this.setListState({
			...prevListState,

			loading: true,
			error: null,
			shouldClean: false,
		});

		this.emitEvent(EventType.loadMore);
		this.emitEvent(EventType.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * set intermediate filter value of the filter without request
	 */
	setFilterValue(filterName: string, value: unknown): void {
		const prevListState = this.listState;

		this.setListState({
			...prevListState,

			filters: {
				...prevListState.filters,

				[filterName]: value,
			},
		});

		this.emitEvent(EventType.setFilterValue);
	}

	/**
	 * apply intermediate filter value and request
	 */
	async applyFilter(filterName: string): Promise<void> {
		const prevListState = this.listState;

		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...requestParamsBeforeChange.appliedFilters,
				[filterName]: prevListState.filters[filterName],
			},
		});

		const stateBeforeChange = this.getListStateBeforeChange();
		this.setListState(stateBeforeChange);

		this.emitEvent(EventType.applyFilter);
		this.emitEvent(EventType.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * set filter value and request
	 */
	async setAndApplyFilter(filterName: string, value: unknown): Promise<void> {
		const prevListState = this.listState;

		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...requestParamsBeforeChange.appliedFilters,
				[filterName]: value,
			},
		});

		const stateBeforeChange = this.getListStateBeforeChange();

		this.setListState({
			...stateBeforeChange,

			filters: {
				...prevListState.filters,

				[filterName]: value,
			},
		});

		this.emitEvent(EventType.setAndApplyFilter);
		this.emitEvent(EventType.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * reset filter to the corresponding value in `resetFiltersTo` (or `undefined`) and request
	 */
	async resetFilter(filterName: string): Promise<void> {
		const prevListState = this.listState;

		const initialValue = this.options.resetFiltersTo[filterName];

		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...requestParamsBeforeChange.appliedFilters,
				[filterName]: initialValue,
			},
		});

		const stateBeforeChange = this.getListStateBeforeChange();

		this.setListState({
			...stateBeforeChange,
			filters: {
				...prevListState.filters,
				[filterName]: initialValue,
			},
		});

		this.emitEvent(EventType.resetFilter);
		this.emitEvent(EventType.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * set multiple intermediate filter values witout request
	 */
	setFiltersValues(values: Record<string, unknown>): void {
		const prevListState = this.listState;

		this.setListState({
			...prevListState,

			filters: {
				...prevListState.filters,
				...values,
			},
		});

		this.emitEvent(EventType.setFiltersValues);
	}

	/**
	 * apply multiple intermediate filter values and request
	 */
	async applyFilters(filtersNames: readonly string[]): Promise<void> {
		const prevListState = this.listState;
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		const newAppliedFilters = filtersNames.reduce<Record<string, unknown>>(
			(res, filterName) => {
				res[filterName] = prevListState.filters[filterName];

				return res;
			},
			{},
		);

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...requestParamsBeforeChange.appliedFilters,
				...newAppliedFilters,
			},
		});

		this.setListState(stateBeforeChange);

		this.emitEvent(EventType.applyFilters);
		this.emitEvent(EventType.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * set multiple filter values and request
	 */
	async setAndApplyFilters(values: Record<string, unknown>): Promise<void> {
		const prevListState = this.listState;
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...requestParamsBeforeChange.appliedFilters,
				...values,
			},
		});

		this.setListState({
			...stateBeforeChange,
			filters: {
				...prevListState.filters,
				...values,
			},
		});

		this.emitEvent(EventType.setAndApplyFilters);
		this.emitEvent(EventType.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * load specific page
	 */
	async setPage(page: number): Promise<void> {
		const prevListState = this.listState;
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setRequestParams({
			...requestParamsBeforeChange,
			page,
		});

		this.setListState(stateBeforeChange);

		this.emitEvent(EventType.setPage);
		this.emitEvent(EventType.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * set number of items on page and request
	 */
	async setPageSize(pageSize: number | null | undefined): Promise<void> {
		const prevListState = this.listState;
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setRequestParams({
			...requestParamsBeforeChange,
			pageSize,
		});

		this.setListState(stateBeforeChange);

		this.emitEvent(EventType.setPageSize);
		this.emitEvent(EventType.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * reset multiple filters to the corresponding value in `resetFiltersTo` (or `undefined`) and request
	 */
	async resetFilters(filtersNames: readonly string[]): Promise<void> {
		const prevListState = this.listState;
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		const { resetFiltersTo } = this.options;

		const filtersForReset = filtersNames.reduce<Record<string, unknown>>(
			(res, filterName) => {
				res[filterName] = resetFiltersTo[filterName];

				return res;
			},
			{},
		);

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...requestParamsBeforeChange.appliedFilters,
				...filtersForReset,
			},
		});

		this.setListState({
			...stateBeforeChange,

			filters: {
				...prevListState.filters,
				...filtersForReset,
			},
		});

		this.emitEvent(EventType.resetFilters);
		this.emitEvent(EventType.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * reset all of the filters to the corresponding value in `resetFiltersTo` (or `undefined`) and request
	 */
	async resetAllFilters(): Promise<void> {
		const prevRequestParams = this.requestParams;
		const prevListState = this.listState;
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		const { resetFiltersTo, saveFiltersOnResetAll, alwaysResetFilters } =
			this.options;

		const savedFilters = saveFiltersOnResetAll.reduce<Record<string, unknown>>(
			(res, filterName) => {
				res[filterName] = prevListState.filters[filterName];

				return res;
			},
			{},
		);

		const savedAppliedFilters = saveFiltersOnResetAll.reduce<
			Record<string, unknown>
		>((res, filterName) => {
			res[filterName] = prevRequestParams.appliedFilters[filterName];

			return res;
		}, {});

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...alwaysResetFilters,
				...resetFiltersTo,
				...savedAppliedFilters,
			},
		});

		this.setListState({
			...stateBeforeChange,
			filters: {
				...alwaysResetFilters,
				...resetFiltersTo,
				...savedFilters,
			},
		});

		this.emitEvent(EventType.resetAllFilters);
		this.emitEvent(EventType.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * reload the list in the current state
	 */
	async reload(): Promise<void> {
		const prevState = this.listState;
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setListState(stateBeforeChange);

		this.emitEvent(EventType.reload);
		this.emitEvent(EventType.changeLoadParams);

		await this.requestItems(prevState);
	}

	getNextAsc(param: string, asc?: boolean): boolean {
		if (typeof asc === "boolean") {
			return asc;
		}

		const prevRequestParams = this.requestParams;

		if (prevRequestParams.sort.param === param) {
			return !prevRequestParams.sort.asc;
		}

		return this.options.isDefaultSortAsc;
	}

	/**
	 * sets sorting column
	 *
	 * if `asc` defined and Boolean, sets it
	 *
	 * otherwise, if this column differs from previous sorting column, asc will be setted with `isDefaultSortAsc` param from decorator
	 *
	 * otherwise, it will be reverse `asc` param from previous state
	 */
	async setSorting(param: string, asc?: boolean): Promise<void> {
		const prevListState = this.listState;
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		const nextAsc = this.getNextAsc(param, asc);

		this.setRequestParams({
			...requestParamsBeforeChange,
			sort: {
				param,
				asc: nextAsc,
			},
		});

		this.setListState(stateBeforeChange);

		this.emitEvent(EventType.setSorting);
		this.emitEvent(EventType.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * resets sorting
	 *
	 * sort param will be setted with `null`, asc will be setted with `isDefaultSortAsc` param
	 */
	async resetSorting(): Promise<void> {
		const prevListState = this.listState;
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		const { isDefaultSortAsc } = this.options;

		this.setRequestParams({
			...requestParamsBeforeChange,
			sort: {
				param: null,
				asc: isDefaultSortAsc,
			},
		});

		this.setListState(stateBeforeChange);

		this.emitEvent(EventType.resetSorting);
		this.emitEvent(EventType.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * set filters, applied filters, sorting, page and pageSize and request then
	 */
	async updateStateAndRequest(
		updateStateParams: UpdateStateParams,
	): Promise<void> {
		const { filters, appliedFilters, sort, page, pageSize } = updateStateParams;

		const prevListState = this.listState;
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters:
				appliedFilters || requestParamsBeforeChange.appliedFilters,
			sort: sort || requestParamsBeforeChange.sort,
			page: page || requestParamsBeforeChange.page,
			pageSize: pageSize || requestParamsBeforeChange.pageSize,
		});

		this.setListState({
			...stateBeforeChange,
			filters: filters || stateBeforeChange.filters,
		});

		this.emitEvent(EventType.updateStateAndRequest);

		await this.requestItems(prevListState);
	}

	async requestItems(
		prevListState: ListState<Item, Additional, Error>,
	): Promise<void> {
		if (
			this.shouldRequest &&
			!this.shouldRequest(prevListState, this.listState)
		) {
			return;
		}

		const nextRequestId = this.requestId + 1;
		++this.requestId;

		const { debounceTimeout } = this.options;

		if (debounceTimeout) {
			await sleep(debounceTimeout);
		}

		if (this.requestId !== nextRequestId) {
			return;
		}

		if (this.refreshTimeoutId) {
			clearTimeout(this.refreshTimeoutId);
			this.refreshTimeoutId = null;
		}

		this.emitEvent(EventType.requestItems);

		let response: ItemsLoaderResponse<Item, Additional> | undefined;
		let error: Error | undefined;
		try {
			response = await this.itemsLoader(this.requestParams, this.listState);
		} catch (e) {
			error = e as Error;
		}

		if (this.requestId !== nextRequestId) {
			return;
		}

		const { refreshTimeout } = this.options;

		if (this.refreshTimeoutId) {
			clearTimeout(this.refreshTimeoutId);
			this.refreshTimeoutId = null;
		}

		if (refreshTimeout) {
			this.refreshTimeoutId = setTimeout(() => {
				this.reload();
			}, refreshTimeout);
		}

		if (error) {
			if (error instanceof LoadListError) {
				this.onError(error);
				return;
			}

			throw error;
		}

		if (response) {
			this.onSuccess(response);
		}
	}

	onSuccess(response: ItemsLoaderResponse<Item, Additional>): void {
		const prevListState = this.listState;

		const { saveItemsWhileLoad } = this.options;

		const isClean = saveItemsWhileLoad && prevListState.shouldClean;

		this.setListState({
			...prevListState,

			loading: false,
			shouldClean: false,
			isFirstLoad: false,

			items: isClean
				? response.items
				: [...prevListState.items, ...response.items],

			loadedPages: isClean ? 1 : prevListState.loadedPages + 1,

			additional:
				typeof response.additional !== "undefined"
					? response.additional
					: prevListState.additional,

			total:
				typeof response.total === "number"
					? response.total
					: prevListState.total,
		});

		this.emitEvent(EventType.loadItemsSuccess);
	}

	onError(error: LoadListError<Error, Additional>): void {
		const prevListState = this.listState;

		this.setListState({
			...prevListState,

			loading: false,
			shouldClean: false,

			error: typeof error.error !== "undefined" ? error.error : null,

			additional:
				typeof error.additional !== "undefined"
					? error.additional
					: prevListState.additional,

			total:
				typeof error.total === "number" ? error.total : prevListState.total,
		});

		this.emitEvent(EventType.loadItemsError);
	}

	/**
	 * insert item by specified index
	 * @param itemIndex index of updated item
	 * @param item updated item
	 * @param additional if defined, set `additional` param of list state
	 */
	insertItem(itemIndex: number, item: Item, additional?: Additional): void {
		const prevListState = this.listState;

		this.setListState({
			...prevListState,

			items: arrayInsert(prevListState.items, itemIndex, item),

			additional:
				typeof additional !== "undefined"
					? additional
					: prevListState.additional,
		});

		this.emitEvent(EventType.insertItem);
	}

	/**
	 * delete item by specified index
	 * @param itemIndex index of deleted item
	 * @param additional if defined, set `additional` param of list state
	 */
	deleteItem(itemIndex: number, additional?: Additional): void {
		const prevListState = this.listState;

		this.setListState({
			...prevListState,

			items: prevListState.items.filter((item, index) => index !== itemIndex),

			additional:
				typeof additional !== "undefined"
					? additional
					: prevListState.additional,
		});

		this.emitEvent(EventType.deleteItem);
	}

	/**
	 * update item by specified index
	 * @param itemIndex index of updated item
	 * @param item updated item
	 * @param additional if defined, set `additional` param of list state
	 */
	updateItem(itemIndex: number, item: Item, additional?: Additional): void {
		const prevListState = this.listState;

		this.setListState({
			...prevListState,

			items: prevListState.items.map((stateItem, index) => {
				if (index === itemIndex) {
					return item;
				}

				return stateItem;
			}),

			additional:
				typeof additional !== "undefined"
					? additional
					: prevListState.additional,
		});

		this.emitEvent(EventType.updateItem);
	}

	setTotal(total: number | null | undefined) {
		this.setListState({
			...this.listState,
			total,
		});
	}

	setRequestParams(nextRequestParams: RequestParams): void {
		this.requestParams = nextRequestParams;

		this.emitEvent(EventType.changeRequestParams);
	}

	setListState(nextListState: ListState<Item, Additional, Error>): void {
		this.listState = nextListState;

		this.emitEvent(EventType.changeListState);
	}

	getListState(): ListState<Item, Additional, Error> {
		return this.listState;
	}
}
