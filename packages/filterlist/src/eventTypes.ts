import type { EventType } from "./types";

export const loadMore: EventType = "loadMore";

export const setFilterValue: EventType = "setFilterValue";
export const applyFilter: EventType = "applyFilter";
export const setAndApplyFilter: EventType = "setAndApplyFilter";
export const resetFilter: EventType = "resetFilter";
export const setFiltersValues: EventType = "setFiltersValues";
export const applyFilters: EventType = "applyFilters";
export const setAndApplyFilters: EventType = "setAndApplyFilters";
export const setPage: EventType = "setPage";
export const setPageSize: EventType = "setPageSize";
export const resetFilters: EventType = "resetFilters";
export const resetAllFilters: EventType = "resetAllFilters";
export const reload: EventType = "reload";
export const setSorting: EventType = "setSorting";
export const resetSorting: EventType = "resetSorting";
export const updateStateAndRequest: EventType = "updateStateAndRequest";

export const changeLoadParams: EventType = "changeLoadParams";

export const insertItem: EventType = "insertItem";
export const deleteItem: EventType = "deleteItem";
export const updateItem: EventType = "updateItem";

export const requestItems: EventType = "requestItems";

export const loadItemsSuccess: EventType = "loadItemsSuccess";
export const loadItemsError: EventType = "loadItemsError";

export const changeListState: EventType = "changeListState";
