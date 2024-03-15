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
  useNavigationType,
  useLocation,
} from 'react-router-dom';

import { Filterlist, type ListState, eventTypes, UpdateStateParams } from '@vtaits/filterlist';

import { Page } from '../../../../examples/ui/Page';
import * as api from '../../../../examples/api';

import type {
  User,
  Additional,
} from '../../../../examples/types';

import type {
  ItemsLoader,
} from '../../src/types';

const getStateFromSearch = (search: string): UpdateStateParams => {
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
    pageSize: parsed.pageSize || 10,
  };
};

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
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const location = useLocation();

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
    });
  });

  const listState = useSyncExternalStore(
    (callback) => {
      filterlist.emitter.on(eventTypes.changeListState, callback);

      return () => {
        filterlist.emitter.off(eventTypes.changeListState, callback);
      };
    },

    () => filterlist.getListState(),
  );

  const onChangeListState = useCallback((newListState: ListState<User, Additional, unknown>) => {
    const newQuery = qs.stringify({
      ...newListState.appliedFilters,
      page: newListState.page,
      pageSize: newListState.pageSize,
      sort: newListState.sort.param
        ? `${newListState.sort.asc ? '' : '-'}${newListState.sort.param}`
        : null,
    });

    navigate(`/?${newQuery}`);
  }, [navigate]);

  useEffect(() => {
    filterlist.emitter.on(eventTypes.changeLoadParams, onChangeListState);

    return () => {
      filterlist.emitter.off(eventTypes.changeLoadParams, onChangeListState);
    };
  }, []);

  useEffect(() => {
    if (navigationType === 'POP') {
      const stateFromSearch = getStateFromSearch(location.search);

      filterlist.updateStateAndRequest(stateFromSearch);
    }
  }, [navigationType, location.search]);

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
    items,
    loading,
    total,
    page,
    pageSize,
     sort,
    filters,
  } = listState;

  return (
    <Page
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
