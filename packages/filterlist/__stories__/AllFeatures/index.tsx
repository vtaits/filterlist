import {
  type ReactElement,
  useState,
  useCallback,
  useSyncExternalStore,
} from 'react';
import { Filterlist, EventType } from '@vtaits/filterlist';
import { Page } from '../../../../examples/ui/Page';
import * as api from '../../../../examples/api';
import type {
  User,
  Additional,
} from '../../../../examples/types';
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

export function AllFeatures(): ReactElement {
  const [filterlist] = useState(() => {
    return new Filterlist({
      loadItems,
      refreshTimeout: 10000,
      filtersConfig: {
        onlyGmail: {
          store: {
            type: 'localStorage',
            key: 'filterlist/AllFeatures/filters/onlyGmail'
          }
        }
      }
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
      filterlist.emitter.on(EventType.changeListState, callback);

      return () => {
        filterlist.emitter.off(EventType.changeListState, callback);
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
