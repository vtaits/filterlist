import {
  type ReactElement,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useFilterlist } from '@vtaits/react-filterlist';
import { useCreateDataStore } from '@vtaits/react-filterlist-router';
import { useRerender } from '@vtaits/react-signals';
import { Page } from '../../../../examples/ui/Page';
import * as api from '../../../../examples/api';
import type {
  User,
} from '../../../../examples/types';

export function DeferredInit(): ReactElement | null {
  const [canInit, setCanInit] = useState(false);

  useEffect((): void => {
    setTimeout((): void => {
      setCanInit(true);
    }, 2000);
  }, []);

  const createDataStore = useCreateDataStore();

  const [requestParamsSignal, listStateSignal, filterlist] = useFilterlist<
  User,
  {
    count: number,
  },
  never,
  unknown
  >({
    canInit,

    createDataStore,

    loadItems: async ({
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
    },
  });

  const setPage = useCallback((page: number) => {
    if (!filterlist) {
      throw new Error('filterlist is not initialized');
    }

    return filterlist.setPage(page);
  }, [filterlist]);

  const setPageSize = useCallback((pageSize: number | null | undefined) => {
    if (!filterlist) {
      throw new Error('filterlist is not initialized');
    }

    return filterlist.setPageSize(pageSize);
  }, [filterlist]);

  const setFilterValue = useCallback((
    filterName: string,
    value: any,
  ): void => {
    if (!filterlist) {
      throw new Error('filterlist is not initialized');
    }

    return filterlist.setFilterValue(
      filterName,
      value,
    );
  }, [filterlist]);

  const setSorting = useCallback((
    paramName: string,
    asc?: boolean,
  ) => {
    if (!filterlist) {
      throw new Error('filterlist is not initialized');
    }

    return filterlist.setSorting(
      paramName,
      asc,
    );
  }, [filterlist]);

  const resetAllFilters = useCallback(
    () => {
      if (!filterlist) {
        throw new Error('filterlist is not initialized');
      }
  
      return filterlist.resetAllFilters();
    },
    [filterlist],
  );

  const reload = useCallback(
    () => {
      if (!filterlist) {
        throw new Error('filterlist is not initialized');
      }
  
      return filterlist.reload();
    },
    [filterlist],
  );

  const resetFilter = useCallback((
    filterName: string,
  ) => {
    if (!filterlist) {
      throw new Error('filterlist is not initialized');
    }

    return filterlist.resetFilter(
      filterName,
    );
  }, [filterlist]);

  const applyFilter = useCallback((
    filterName: string,
  ) => {
    if (!filterlist) {
      throw new Error('filterlist is not initialized');
    }

    return filterlist.applyFilter(
      filterName,
    );
  }, [filterlist]);

  const listState = listStateSignal.get();
  const requestParams = requestParamsSignal.get();

  useRerender([requestParamsSignal, listStateSignal]);

  if (!listState || !requestParams) {
    return null;
  }

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
      loading={loading}
      setFilterValue={setFilterValue}
      resetFilter={resetFilter}
      applyFilter={applyFilter}
      resetAllFilters={resetAllFilters}
      reload={reload}
      total={total}
      setPage={setPage}
      setPageSize={setPageSize}
      setSorting={setSorting}
    />
  );
}
