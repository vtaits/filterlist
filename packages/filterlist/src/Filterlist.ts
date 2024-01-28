import mitt from "mitt";
import type { Emitter } from "mitt";

import { collectListInitialState } from "./collectListInitialState";
import { collectOptions } from "./collectOptions";

import { arrayInsert } from "./arrayInsert";

import { LoadListError } from "./errors";
import * as eventTypes from "./eventTypes";

import type {
	EventType,
	ItemsLoader,
	ItemsLoaderResponse,
	ListState,
	Options,
	Params,
	ShouldRequest,
	UpdateStateParams,
} from "./types";

export class Filterlist<Item, Additional, Error> {
	requestId: number;

	listState: ListState<Item, Additional, Error>;

	options: Options;

	itemsLoader: ItemsLoader<Item, Additional, Error>;

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
		this.listState = collectListInitialState(params);
		this.options = collectOptions(params);

		this.onInit();
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
			page: 1,

			shouldClean: true,
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

			appliedFilters: {
				...stateBeforeReload.appliedFilters,
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

		this.emitEvent(eventTypes.loadMore);

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

		this.emitEvent(eventTypes.loadMore);
		this.emitEvent(eventTypes.changeLoadParams);

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

		this.emitEvent(eventTypes.setFilterValue);
	}

	/**
	 * apply intermediate filter value and request
	 */
	async applyFilter(filterName: string): Promise<void> {
		const prevListState = this.listState;
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setListState({
			...stateBeforeChange,

			appliedFilters: {
				...stateBeforeChange.appliedFilters,
				[filterName]: prevListState.filters[filterName],
			},
		});

		this.emitEvent(eventTypes.applyFilter);
		this.emitEvent(eventTypes.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * set filter value and request
	 */
	async setAndApplyFilter(filterName: string, value: unknown): Promise<void> {
		const prevListState = this.listState;
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setListState({
			...stateBeforeChange,

			filters: {
				...prevListState.filters,

				[filterName]: value,
			},

			appliedFilters: {
				...stateBeforeChange.appliedFilters,
				[filterName]: value,
			},
		});

		this.emitEvent(eventTypes.setAndApplyFilter);
		this.emitEvent(eventTypes.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * reset filter to the corresponding value in `resetFiltersTo` (or `undefined`) and request
	 */
	async resetFilter(filterName: string): Promise<void> {
		const prevListState = this.listState;
		const stateBeforeChange = this.getListStateBeforeChange();

		const initialValue = this.options.resetFiltersTo[filterName];

		this.setListState({
			...stateBeforeChange,

			filters: {
				...prevListState.filters,

				[filterName]: initialValue,
			},

			appliedFilters: {
				...stateBeforeChange.appliedFilters,
				[filterName]: initialValue,
			},
		});

		this.emitEvent(eventTypes.resetFilter);
		this.emitEvent(eventTypes.changeLoadParams);

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

		this.emitEvent(eventTypes.setFiltersValues);
	}

	/**
	 * apply multiple intermediate filter values and request
	 */
	async applyFilters(filtersNames: string[]): Promise<void> {
		const prevListState = this.listState;
		const stateBeforeChange = this.getListStateBeforeChange();

		const newAppliedFilters = filtersNames.reduce<Record<string, unknown>>(
			(res, filterName) => {
				res[filterName] = prevListState.filters[filterName];

				return res;
			},
			{},
		);

		this.setListState({
			...stateBeforeChange,

			appliedFilters: {
				...stateBeforeChange.appliedFilters,
				...newAppliedFilters,
			},
		});

		this.emitEvent(eventTypes.applyFilters);
		this.emitEvent(eventTypes.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * set multiple filter values and request
	 */
	async setAndApplyFilters(values: Record<string, unknown>): Promise<void> {
		const prevListState = this.listState;
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setListState({
			...stateBeforeChange,

			filters: {
				...prevListState.filters,
				...values,
			},

			appliedFilters: {
				...stateBeforeChange.appliedFilters,
				...values,
			},
		});

		this.emitEvent(eventTypes.setAndApplyFilters);
		this.emitEvent(eventTypes.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * load specific page
	 */
	async setPage(page: number): Promise<void> {
		const prevListState = this.listState;
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setListState({
			...stateBeforeChange,
			page,
		});

		this.emitEvent(eventTypes.setPage);
		this.emitEvent(eventTypes.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * set number of items on page and request
	 */
	async setPageSize(pageSize: number | null | undefined): Promise<void> {
		const prevListState = this.listState;
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setListState({
			...stateBeforeChange,
			pageSize,
		});

		this.emitEvent(eventTypes.setPageSize);
		this.emitEvent(eventTypes.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * reset multiple filters to the corresponding value in `resetFiltersTo` (or `undefined`) and request
	 */
	async resetFilters(filtersNames: string[]): Promise<void> {
		const prevListState = this.listState;
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

			appliedFilters: {
				...stateBeforeChange.appliedFilters,
				...filtersForReset,
			},
		});

		this.emitEvent(eventTypes.resetFilters);
		this.emitEvent(eventTypes.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * reset all of the filters to the corresponding value in `resetFiltersTo` (or `undefined`) and request
	 */
	async resetAllFilters(): Promise<void> {
		const prevListState = this.listState;
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
			res[filterName] = prevListState.appliedFilters[filterName];

			return res;
		}, {});

		this.setListState({
			...stateBeforeChange,

			filters: {
				...alwaysResetFilters,
				...resetFiltersTo,
				...savedFilters,
			},

			appliedFilters: {
				...alwaysResetFilters,
				...resetFiltersTo,
				...savedAppliedFilters,
			},
		});

		this.emitEvent(eventTypes.resetAllFilters);
		this.emitEvent(eventTypes.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * reload the list in the current state
	 */
	async reload(): Promise<void> {
		const prevState = this.listState;
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setListState(stateBeforeChange);

		this.emitEvent(eventTypes.reload);
		this.emitEvent(eventTypes.changeLoadParams);

		await this.requestItems(prevState);
	}

	getNextAsc(param: string, asc?: boolean): boolean {
		if (typeof asc === "boolean") {
			return asc;
		}

		const prevListState = this.listState;

		if (prevListState.sort.param === param) {
			return !prevListState.sort.asc;
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
		const stateBeforeChange = this.getListStateBeforeChange();

		const nextAsc = this.getNextAsc(param, asc);

		this.setListState({
			...stateBeforeChange,

			sort: {
				param,
				asc: nextAsc,
			},
		});

		this.emitEvent(eventTypes.setSorting);
		this.emitEvent(eventTypes.changeLoadParams);

		await this.requestItems(prevListState);
	}

	/**
	 * resets sorting
	 *
	 * sort param will be setted with `null`, asc will be setted with `isDefaultSortAsc` param
	 */
	async resetSorting(): Promise<void> {
		const prevListState = this.listState;
		const stateBeforeChange = this.getListStateBeforeChange();

		const { isDefaultSortAsc } = this.options;

		this.setListState({
			...stateBeforeChange,

			sort: {
				param: null,
				asc: isDefaultSortAsc,
			},
		});

		this.emitEvent(eventTypes.resetSorting);
		this.emitEvent(eventTypes.changeLoadParams);

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
		const stateBeforeChange = this.getListStateBeforeChange();

		this.setListState({
			...stateBeforeChange,

			filters: filters || stateBeforeChange.filters,
			appliedFilters: appliedFilters || stateBeforeChange.appliedFilters,
			sort: sort || stateBeforeChange.sort,
			page: page || stateBeforeChange.page,
			pageSize: pageSize || stateBeforeChange.pageSize,
		});

		this.emitEvent(eventTypes.updateStateAndRequest);

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

		this.emitEvent(eventTypes.requestItems);

		let response: ItemsLoaderResponse<Item, Additional> | undefined;
		let error: Error | undefined;
		try {
			response = await this.itemsLoader(this.listState);
		} catch (e) {
			error = e as Error;
		}

		if (this.requestId !== nextRequestId) {
			return;
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

		this.emitEvent(eventTypes.loadItemsSuccess);
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

		this.emitEvent(eventTypes.loadItemsError);
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

		this.emitEvent(eventTypes.insertItem);
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

		this.emitEvent(eventTypes.deleteItem);
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

		this.emitEvent(eventTypes.updateItem);
	}

	setTotal(total: number | null | undefined) {
		this.setListState({
			...this.listState,
			total,
		});
	}

	setListState(nextListState: ListState<Item, Additional, Error>): void {
		this.listState = nextListState;

		this.emitEvent(eventTypes.changeListState);
	}

	getListState(): ListState<Item, Additional, Error> {
		return this.listState;
	}
}
