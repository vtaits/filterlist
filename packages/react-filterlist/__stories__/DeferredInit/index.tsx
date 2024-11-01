import React, {
  type ReactElement,
  useState,
  useCallback,
  useEffect,
} from 'react';
import qs from 'qs';
import {
  type Location,
  useNavigate,
  useNavigationType,
  useLocation,
} from 'react-router-dom';
import { useFilterlist } from '@vtaits/react-filterlist';
import { useSignalEffect, useRerender } from '@vtaits/react-signals';
import type {
  UpdateStateParams,
} from '@vtaits/filterlist';
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

  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const location = useLocation();

  const [requestParamsSignal, listStateSignal, filterlist] = useFilterlist<
  User,
  {
    count: number,
  },
  never,
  {
    navigationType: string;
    location: Location;
  }
  >({
    canInit,

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

    parseFiltersAndSort: async ({
      location: {
        search,
      },
    }): Promise<UpdateStateParams> => {
      const parsed: Record<string, any> = qs.parse(search, {
        ignoreQueryPrefix: true,
      });

      const {
        sort,
      } = parsed;

      const appliedFilters = {
        name: parsed.name || '',
        email: parsed.email || '',
        city: parsed.city || '',
      };

      return {
        sort: {
          param: sort
            ? (
              sort[0] === '-'
                ? sort.substring(1, sort.length)
                : sort
            )
            : 'id',

          asc: !sort || sort[0] === '-',
        },

        filters: appliedFilters,
        appliedFilters,
        page: parsed.page ? Number(parsed.page) : 1,
        pageSize: (parsed.pageSize && Number(parsed.pageSize)) || 10,
      };
    },

    filtersAndSortData: {
      navigationType,
      location,
    },

    shouldRecount: ({
      navigationType: navigationTypeParam,
      location,
    }, prevProps) => navigationTypeParam === 'POP'
      && location.search !== prevProps.location.search,
  });

  useSignalEffect(() => {
    const nextRequestParams = requestParamsSignal.get();

    if (nextRequestParams) {
      const newQuery = qs.stringify({
        ...nextRequestParams.appliedFilters,
        page: nextRequestParams.page,
        pageSize: nextRequestParams.pageSize,
        sort: nextRequestParams.sort.param
          ? `${nextRequestParams.sort.asc ? '' : '-'}${nextRequestParams.sort.param}`
          : null,
      });
  
      navigate(`${location.pathname}?${newQuery}`);
    }
  }, []);

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
