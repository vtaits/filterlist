import {
  type ReactElement,
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from 'react';
import {
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Filterlist, EventType } from '@vtaits/filterlist';
import { createEmitter, createStringBasedDataStore } from '@vtaits/filterlist/datastore/string';
import { Page } from '../../../../examples/ui/Page';
import * as api from '../../../../examples/api';
import {useLatest} from '@vtaits/use-latest';

import type {
  User,
  Additional,
} from '/home/vadim/projects/filterlist/examples/types';

import type {
  ItemsLoader,
} from '../../src/types';

const loadItems: ItemsLoader<User, Additional, unknown> = async ({
  sort,
  appliedFilters,
  page,
  pageSize,
}) => {
  const response = await api.loadUsers({
    ...appliedFilters,
    page,
    pageSize,
    sort: `${sort.param ? `${sort.asc ? '' : '-'}${sort.param}` : ''}`,
  });

  return {
    items: response.users,
    total: response.count,
  };
};

export function HistoryDataStore(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    search,
  } = location;

  const [emitter] = useState(() => createEmitter());

  const navigateRef = useLatest(navigate);
  const searchRef = useLatest(location.search);

  useEffect(() => {
    emitter.emit();
  }, [search]);

  const createDataStore = useCallback(() => createStringBasedDataStore(
    () => searchRef.current,
    (nextSearch) => {
      navigateRef.current(`/?${nextSearch}`)
    },
    emitter,
  ), [emitter, navigateRef, searchRef]);

  const [filterlist] = useState(() => {
    return new Filterlist({
      loadItems,
      refreshTimeout: 10000,
      createDataStore,
    });
  });

  const listState = useSyncExternalStore(
    (callback) => {
      filterlist.emitter.on(EventType.changeListState, callback);

      return () => {
        filterlist.emitter.off(EventType.changeListState, callback);
      };
    },

    () => filterlist.getListState(),
  );

  const requestParams = useSyncExternalStore(
    (callback) => {
      filterlist.emitter.on(EventType.changeRequestParams, callback);

      return () => {
        filterlist.emitter.off(EventType.changeRequestParams, callback);
      };
    },

    () => filterlist.getRequestParams(),
  );

  const setPage = useCallback((
    page: number,
  ) => filterlist.setPage(page), [filterlist]);

  const setPageSize = useCallback((
    pageSize: number | null | undefined,
  ) => filterlist.setPageSize(pageSize), [filterlist]);

  const setFilterValue = useCallback((
    filterName: string,
    value: unknown,
  ) => filterlist.setFilterValue(
    filterName,
    value,
  ), []);

  const setAndApplyFilter = useCallback((
    filterName: string,
    value: unknown,
  ) => filterlist.setAndApplyFilter(
    filterName,
    value,
  ), []);

  const setSorting = useCallback((
    paramName: string,
    asc?: boolean,
  ) => filterlist.setSorting(
    paramName,
    asc,
  ), [filterlist]);

  const resetAllFilters = useCallback(() => filterlist.resetAllFilters(), [filterlist]);

  const reload = useCallback(() => filterlist.reload(), [filterlist]);

  const resetFilter = useCallback((
    filterName: string,
  ) => filterlist.resetFilter(
    filterName,
  ), [filterlist]);

  const applyFilter = useCallback((
    filterName: string,
  ) => filterlist.applyFilter(
    filterName,
  ), [filterlist]);

  const {
    page,
    pageSize,
    sort,
  } = requestParams;

  const {
    items,
    loading,
    total,
    filters,
  } = listState;

  return (
    <Page
      requestParams={requestParams}
      listState={listState}
      filters={filters}
      page={page}
      pageSize={pageSize}
      sort={sort}
      items={items}
      total={total}
      loading={loading}
      setFilterValue={setFilterValue}
      resetFilter={resetFilter}
      applyFilter={applyFilter}
      setAndApplyFilter={setAndApplyFilter}
      setPage={setPage}
      setPageSize={setPageSize}
      resetAllFilters={resetAllFilters}
      reload={reload}
      setSorting={setSorting}
    />
  );
}
