import { tryCatch } from "krustykrab";
import mitt, { type Emitter } from "mitt";
import { Signal } from "signal-polyfill";
import sleep from "sleep-promise";
import { arrayInsert } from "./arrayInsert";
import { collectListInitialState } from "./collectListInitialState";
import { collectOptions } from "./collectOptions";
import { createDefaultDataStore } from "./createDefaultDataStore";
import { LoadListError } from "./errors";
import {
	type DataStore,
	EventType,
	type ItemsLoader,
	type ItemsLoaderResponse,
	type ListState,
	LoadListAction,
	type Options,
	type Params,
	type RequestParams,
	type UpdateStateParams,
} from "./types";

export class Filterlist<Item, Additional, Error> {
	requestId: number;

	dataStoreRequestParams: Signal.State<RequestParams>;

	localStorageFilters: Signal.State<Record<string, unknown>>;

	requestParams: Signal.Computed<RequestParams>;

	dataStore: DataStore;

	dataStoreUnsubscribe: VoidFunction;

	listState: ListState<Item, Additional, Error>;

	options: Options;

	itemsLoader: ItemsLoader<Item, Additional, Error>;

	shouldRefresh?: () => boolean;

	refreshTimeout?: number;

	refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

	emitter: Emitter<Record<EventType, ListState<Item, Additional, Error>>>;

	constructor(params: Params<Item, Additional, Error>) {
		this.emitter = mitt();

		const { createDataStore = createDefaultDataStore, loadItems } = params;

		if (!loadItems) {
			throw new Error("loadItems is required");
		}

		if (typeof loadItems !== "function") {
			throw new Error("loadItems should be a function");
		}

		this.itemsLoader = loadItems;

		this.requestId = 0;

		const [requestParams, listState] = collectListInitialState(params);

		this.options = collectOptions(params);

		const localStorageFilters: Record<string, unknown> = {};

		for (const [filterName, filterConfig] of Object.entries(
			this.options.filtersConfig,
		)) {
			if (filterConfig?.store) {
				switch (filterConfig.store.type) {
					case "localStorage":
						{
							const strValue = localStorage.getItem(filterConfig.store.key);

							if (strValue) {
								const parsedValue = tryCatch(() => JSON.parse(strValue));

								if (parsedValue.isOk()) {
									localStorageFilters[filterName] = parsedValue.unwrap();
								}
							}
						}
						break;

					default:
						break;
				}
			}
		}

		this.localStorageFilters = new Signal.State(localStorageFilters);

		this.dataStore = createDataStore({
			initialRequestParams: requestParams,
			excludeFiltersFromDataStore: this.options.excludeFiltersFromDataStore,
		});

		this.dataStoreRequestParams = new Signal.State(this.dataStore.getValue());

		this.requestParams = new Signal.Computed(() => {
			const { appliedFilters, page, sort, pageSize } =
				this.dataStoreRequestParams.get();

			return {
				appliedFilters: {
					...appliedFilters,
					...this.localStorageFilters.get(),
				},
				page,
				sort,
				pageSize,
			};
		});

		this.dataStoreUnsubscribe = this.dataStore.subscribe(
			this.onChangeDataStore,
		);

		this.listState = {
			...listState,
			filters: this.getRequestParams().appliedFilters,
		};

		this.refreshTimeout = params.refreshTimeout;
		this.shouldRefresh = params.shouldRefresh;

		this.onInit();
	}

	destroy() {
		this.dataStoreUnsubscribe();

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

		const requestParams = this.getRequestParams();

		return {
			...requestParams,
			appliedFilters: {
				...requestParams.appliedFilters,
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

		await this.requestItems(LoadListAction.init);
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

		await this.requestItems(LoadListAction.loadMore);
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
	applyFilter(filterName: string) {
		const prevListState = this.listState;

		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();

		const stateBeforeChange = this.getListStateBeforeChange();
		this.setListState(stateBeforeChange);

		this.emitEvent(EventType.applyFilter);
		this.emitEvent(EventType.changeLoadParams);

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...requestParamsBeforeChange.appliedFilters,
				[filterName]: prevListState.filters[filterName],
			},
		});
	}

	/**
	 * set filter value and request
	 */
	setAndApplyFilter(filterName: string, value: unknown) {
		const prevListState = this.listState;

		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();

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

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...requestParamsBeforeChange.appliedFilters,
				[filterName]: value,
			},
		});
	}

	/**
	 * reset filter to the corresponding value in `resetFiltersTo` (or `undefined`) and request
	 */
	resetFilter(filterName: string) {
		const prevListState = this.listState;

		const initialValue = this.options.resetFiltersTo[filterName];

		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();

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

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...requestParamsBeforeChange.appliedFilters,
				[filterName]: initialValue,
			},
		});
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
	applyFilters(filtersNames: readonly string[]) {
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

		this.setListState(stateBeforeChange);

		this.emitEvent(EventType.applyFilters);
		this.emitEvent(EventType.changeLoadParams);

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...requestParamsBeforeChange.appliedFilters,
				...newAppliedFilters,
			},
		});
	}

	/**
	 * set multiple filter values and request
	 */
	setAndApplyFilters(values: Record<string, unknown>) {
		const prevListState = this.listState;
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setListState({
			...stateBeforeChange,
			filters: {
				...prevListState.filters,
				...values,
			},
		});

		this.emitEvent(EventType.setAndApplyFilters);
		this.emitEvent(EventType.changeLoadParams);

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...requestParamsBeforeChange.appliedFilters,
				...values,
			},
		});
	}

	/**
	 * set multiple filter values that currently `undefined` and request
	 */
	setAndApplyEmptyFilters(values: Record<string, unknown>) {
		const prevListState = this.listState;
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		const filtersForApply = Object.fromEntries(
			Object.entries(values).filter(
				([filterName]) =>
					typeof requestParamsBeforeChange.appliedFilters[filterName] ===
					"undefined",
			),
		);

		this.setListState({
			...stateBeforeChange,
			filters: {
				...prevListState.filters,
				...filtersForApply,
			},
		});

		this.emitEvent(EventType.setAndApplyEmptyFilters);
		this.emitEvent(EventType.changeLoadParams);

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...requestParamsBeforeChange.appliedFilters,
				...filtersForApply,
			},
		});
	}

	/**
	 * load specific page
	 */
	setPage(page: number) {
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setListState(stateBeforeChange);

		this.emitEvent(EventType.setPage);
		this.emitEvent(EventType.changeLoadParams);

		this.setRequestParams({
			...requestParamsBeforeChange,
			page,
		});
	}

	/**
	 * set number of items on page and request
	 */
	setPageSize(pageSize: number | null | undefined) {
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setListState(stateBeforeChange);

		this.emitEvent(EventType.setPageSize);
		this.emitEvent(EventType.changeLoadParams);

		this.setRequestParams({
			...requestParamsBeforeChange,
			pageSize,
		});
	}

	/**
	 * reset multiple filters to the corresponding value in `resetFiltersTo` (or `undefined`) and request
	 */
	resetFilters(filtersNames: readonly string[]) {
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

		this.setListState({
			...stateBeforeChange,

			filters: {
				...prevListState.filters,
				...filtersForReset,
			},
		});

		this.emitEvent(EventType.resetFilters);
		this.emitEvent(EventType.changeLoadParams);

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...requestParamsBeforeChange.appliedFilters,
				...filtersForReset,
			},
		});
	}

	/**
	 * reset all of the filters to the corresponding value in `resetFiltersTo` (or `undefined`) and request
	 */
	resetAllFilters() {
		const prevRequestParams = this.getRequestParams();
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

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters: {
				...alwaysResetFilters,
				...resetFiltersTo,
				...savedAppliedFilters,
			},
		});
	}

	/**
	 * reload the list in the current state
	 */
	async reload(): Promise<void> {
		const stateBeforeChange = this.getListStateBeforeReload();

		this.setListState(stateBeforeChange);

		this.emitEvent(EventType.reload);
		this.emitEvent(EventType.changeLoadParams);

		await this.requestItems(LoadListAction.reload);
	}

	getNextAsc(param: string, asc?: boolean): boolean {
		if (typeof asc === "boolean") {
			return asc;
		}

		const prevRequestParams = this.dataStore.getValue();

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
	setSorting(param: string, asc?: boolean) {
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		const nextAsc = this.getNextAsc(param, asc);

		this.setListState(stateBeforeChange);

		this.emitEvent(EventType.setSorting);
		this.emitEvent(EventType.changeLoadParams);

		this.setRequestParams({
			...requestParamsBeforeChange,
			sort: {
				param,
				asc: nextAsc,
			},
		});
	}

	/**
	 * resets sorting
	 *
	 * sort param will be setted with `null`, asc will be setted with `isDefaultSortAsc` param
	 */
	resetSorting() {
		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		const { isDefaultSortAsc } = this.options;

		this.setListState(stateBeforeChange);

		this.emitEvent(EventType.resetSorting);
		this.emitEvent(EventType.changeLoadParams);

		this.setRequestParams({
			...requestParamsBeforeChange,
			sort: {
				param: null,
				asc: isDefaultSortAsc,
			},
		});
	}

	/**
	 * set filters, applied filters, sorting, page and pageSize and request then
	 */
	updateStateAndRequest(updateStateParams: UpdateStateParams) {
		const { filters, appliedFilters, sort, page, pageSize } = updateStateParams;

		const requestParamsBeforeChange = this.getRequestParamsBeforeChange();
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setListState({
			...stateBeforeChange,
			filters: filters || stateBeforeChange.filters,
		});

		this.emitEvent(EventType.updateStateAndRequest);

		this.setRequestParams({
			...requestParamsBeforeChange,
			appliedFilters:
				appliedFilters || requestParamsBeforeChange.appliedFilters,
			sort: sort || requestParamsBeforeChange.sort,
			page: page || requestParamsBeforeChange.page,
			pageSize: pageSize || requestParamsBeforeChange.pageSize,
		});
	}

	async requestItems(action: LoadListAction) {
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
			response = await this.itemsLoader(
				this.getRequestParams(),
				this.listState,
				action,
			);
		} catch (e) {
			error = e as Error;
		}

		if (this.requestId !== nextRequestId) {
			return;
		}

		if (this.refreshTimeoutId) {
			clearTimeout(this.refreshTimeoutId);
			this.refreshTimeoutId = null;
		}

		if (typeof this.refreshTimeout === "number" && this.refreshTimeout > 0) {
			this.refreshTimeoutId = setTimeout(() => {
				this.reloadByTimeout();
			}, this.refreshTimeout);
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

		const loadedPages = response.loadedPages ?? 1;

		this.setListState({
			...prevListState,

			loading: false,
			shouldClean: false,
			isFirstLoad: false,

			items: isClean
				? response.items
				: [...prevListState.items, ...response.items],

			loadedPages: isClean
				? loadedPages
				: prevListState.loadedPages + loadedPages,

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

			items: prevListState.items.filter((_item, index) => index !== itemIndex),

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

	setRequestParams(nextRequestParams: RequestParams) {
		let hasAppliedFilters = false;
		const changedLocalStorageFilters: Record<string, unknown> = {};

		for (const [filterName, filterValue] of Object.entries(
			nextRequestParams.appliedFilters,
		)) {
			const filterConfig = this.options.filtersConfig[filterName];

			if (filterConfig?.store) {
				switch (filterConfig.store.type) {
					case "localStorage":
						localStorage.setItem(
							filterConfig.store.key,
							JSON.stringify(filterValue),
						);
						changedLocalStorageFilters[filterName] = filterValue;
						hasAppliedFilters = true;
						break;

					default:
						break;
				}
			}
		}

		if (hasAppliedFilters) {
			const prevLocalStorageFilters = this.localStorageFilters.get();

			this.localStorageFilters.set({
				...prevLocalStorageFilters,
				...changedLocalStorageFilters,
			});

			this.requestItems(LoadListAction.changeRequestParams);
		}

		this.dataStore.setValue(nextRequestParams);
	}

	onChangeDataStore = (nextValue: RequestParams, prevValue: RequestParams) => {
		this.dataStoreRequestParams.set(nextValue);

		const changedFilters = Object.keys({
			...nextValue.appliedFilters,
			...prevValue.appliedFilters,
			...this.listState.filters,
		}).reduce<Record<string, unknown>>((res, filterKey) => {
			if (
				nextValue.appliedFilters[filterKey] !==
				prevValue.appliedFilters[filterKey]
			) {
				res[filterKey] = nextValue.appliedFilters[filterKey];
			}

			return res;
		}, {});

		this.storePageSize(nextValue.pageSize);

		const stateBeforeChange = this.getListStateBeforeChange();
		this.setListState({
			...stateBeforeChange,
			filters: {
				...stateBeforeChange.filters,
				...changedFilters,
			},
		});

		this.emitEvent(EventType.changeRequestParams);

		this.requestItems(LoadListAction.changeRequestParams);
	};

	setListState(nextListState: ListState<Item, Additional, Error>): void {
		this.listState = nextListState;

		this.emitEvent(EventType.changeListState);
	}

	getListState(): ListState<Item, Additional, Error> {
		return this.listState;
	}

	getRequestParams(): RequestParams {
		return this.requestParams.get();
	}

	reloadByTimeout() {
		if (this.shouldRefresh && !this.shouldRefresh()) {
			this.refreshTimeoutId = setTimeout(() => {
				this.reloadByTimeout();
			}, this.refreshTimeout);

			return;
		}

		this.reload();
	}

	setRefreshTimeout(nextValue: number | null | undefined) {
		this.refreshTimeout = nextValue || undefined;

		if (this.refreshTimeoutId) {
			clearTimeout(this.refreshTimeoutId);
			this.refreshTimeoutId = null;
		}

		if (typeof this.refreshTimeout === "number" && this.refreshTimeout > 0) {
			this.refreshTimeoutId = setTimeout(() => {
				this.reloadByTimeout();
			}, this.refreshTimeout);
		}
	}

	storePageSize(pageSize: number | null | undefined) {
		const { pageSizeLocalStorageKey } = this.options;

		if (!pageSizeLocalStorageKey) {
			return;
		}

		if (pageSize) {
			localStorage.setItem(pageSizeLocalStorageKey, `${pageSize}`);
			return;
		}

		localStorage.removeItem(pageSizeLocalStorageKey);
	}
}
