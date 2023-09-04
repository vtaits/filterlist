import {
  useState,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from 'react';
import type {
  ReactElement,
} from 'react';

import qs from 'qs';

import {
  useNavigate,
  useNavigationType,
  useLocation,
} from 'react-router-dom';

import { Filterlist, eventTypes } from '@vtaits/filterlist';

import { Page } from '../../../../examples/ui/Page';
import * as api from '../../../../examples/api';

import type {
  User,
  Additional,
} from '../../../../examples/types';

import type {
  ItemsLoader,
  Sort,
} from '../../src/types';

const getStateFromSearch = (search: string): {
  sort: Sort;
  filters: Record<string, string | number>;
  appliedFilters: Record<string, string | number>;
} => {
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
    page: parsed.page ? Number(parsed.page) : 1,
    perPage: parsed.perPage || 10,
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
  };
};

const loadItems: ItemsLoader<User, Additional, unknown> = async ({
  sort,
  appliedFilters,
}) => {
  const response = await api.loadUsers({
    ...appliedFilters,
    sort: `${sort.param ? `${sort.asc ? '' : '-'}${sort.param}` : ''}`,
  });

  return {
    items: response.users,
    additional: {
      count: response.count,
    },
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
      alwaysResetFilters: {
        page: 1,
      },

      resetFiltersTo: {
        perPage: 10,
      },

      saveFiltersOnResetAll: ['perPage'],

      loadItems,

      ...stateFromSearch,
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

  const onChangeListState = useCallback((newListState) => {
    const newQuery = qs.stringify({
      ...newListState.appliedFilters,
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

      filterlist.setFiltersAndSorting(stateFromSearch);
    }
  }, [navigationType, location.search]);

  const setAndApplyFilter = useCallback((
    filterName: string,
    value: any,
  ) => filterlist.setAndApplyFilter(
    filterName,
    value,
  ), []);

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
  ), []);

  const resetAllFilters = useCallback(() => filterlist.resetAllFilters(), []);

  const reload = useCallback(() => filterlist.reload(), []);

  const resetFilter = useCallback((
    filterName: string,
  ) => filterlist.resetFilter(
    filterName,
  ), []);

  const applyFilter = useCallback((
    filterName: string,
  ) => filterlist.applyFilter(
    filterName,
  ), []);

  const {
    additional,
    items,
    loading,

    sort,

    filters,
    appliedFilters,
  } = listState;

  return (
    <Page
      listState={listState}
      filters={filters}
      appliedFilters={appliedFilters}
      sort={sort}
      items={items}
      additional={additional}
      loading={loading}
      setFilterValue={setFilterValue}
      resetFilter={resetFilter}
      applyFilter={applyFilter}
      setAndApplyFilter={setAndApplyFilter}
      resetAllFilters={resetAllFilters}
      reload={reload}
      setSorting={setSorting}
    />
  );
}
