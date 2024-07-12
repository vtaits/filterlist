import {
  type ReactElement,
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from 'react';
import qs from 'qs';
import {
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { Filterlist, EventType, RequestParams, DataStore } from '@vtaits/filterlist';
import { Page } from '/home/vadim/projects/filterlist/examples/ui/Page';
import * as api from '/home/vadim/projects/filterlist/examples/api';
import useLatest from 'use-latest';

import type {
  User,
  Additional,
} from '/home/vadim/projects/filterlist/examples/types';

import type {
  ItemsLoader,
} from '../../src/types';
import mitt from 'mitt';

function getStateFromSearch(search: string): RequestParams {
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
    appliedFilters,
    page: parsed.page ? Number(parsed.page) : 1,
    pageSize: parsed.pageSize || 10,
  };
}

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

  const [emitter] = useState(() => mitt());

  const navigateRef = useLatest(navigate);
  const searchRef = useLatest(location.search);

  useEffect(() => {
    emitter.emit('UPDATE_SEARCH');
  }, [search]);

  const createDataStore = useCallback((): DataStore => {
    let cacheKey: string | null = null;
    let cacheValue: RequestParams = {
      appliedFilters: {},
      page: 1,
      sort: {
        asc: false,
      },
    };

    return {
      getValue: () => {
        if (cacheKey !== searchRef.current) {
          cacheKey = searchRef.current;
          cacheValue = getStateFromSearch(searchRef.current);
        }

        return cacheValue;
      },
      setValue: (nextRequestParams) => {
        const newQuery = qs.stringify({
          ...nextRequestParams.appliedFilters,
          page: nextRequestParams.page,
          pageSize: nextRequestParams.pageSize,
          sort: nextRequestParams.sort?.param
            ? `${nextRequestParams.sort.asc ? '' : '-'}${nextRequestParams.sort.param}`
            : null,
        });
    
        navigateRef.current(`/?${newQuery}`);
      },

      subscribe: (callback) => {
        const listenCallback = () => {
          if (cacheKey !== searchRef.current) {
            cacheKey = searchRef.current;
            cacheValue = getStateFromSearch(searchRef.current);
          }

          callback(cacheValue);
        };

        emitter.on('UPDATE_SEARCH', listenCallback);

        return () => {
          emitter.off('UPDATE_SEARCH', listenCallback);
        };
      },
    }
  }, [emitter]);

  const [filterlist] = useState(() => {
    const {
      search,
    } = location;

    const stateFromSearch = getStateFromSearch(search);

    return new Filterlist({
      loadItems,
      ...stateFromSearch,
      page: stateFromSearch.page ? Number(stateFromSearch.page) : 1,
      pageSize: stateFromSearch.pageSize ? Number(stateFromSearch.pageSize) : 10,
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
      setPage={setPage}
      setPageSize={setPageSize}
      resetAllFilters={resetAllFilters}
      reload={reload}
      setSorting={setSorting}
    />
  );
}
