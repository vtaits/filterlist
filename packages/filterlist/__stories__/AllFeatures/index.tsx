import {
  type ReactElement,
  useState,
  useCallback,
} from 'react';
import { Filterlist } from '@vtaits/filterlist';
import { useRerender } from '@vtaits/react-signals';
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
    });
  });

  const {
    listState,
    requestParams,
  } = filterlist;

  useRerender([listState, requestParams])

  const setPage = useCallback((
    page: number,
  ) => filterlist.setPage(page), [filterlist]);

  const setPageSize = useCallback((
    pageSize: number | null | undefined,
  ) => filterlist.setPageSize(pageSize), [filterlist]);

  const setFilterValue = useCallback((
    filterName: string,
    value: any,
  ) => filterlist.setFilterValue(
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
  } = requestParams.get();

  const {
    items,
    loading,
    total,
    filters,
  } = listState.get();

  return (
    <Page
      requestParams={requestParams.get()}
      listState={listState.get()}
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
      setPage={setPage}
      setPageSize={setPageSize}
      resetAllFilters={resetAllFilters}
      reload={reload}
      setSorting={setSorting}
    />
  );
}
