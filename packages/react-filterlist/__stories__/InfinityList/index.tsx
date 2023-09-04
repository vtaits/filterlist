import {
  type ReactElement,
  useCallback,
} from 'react';

import qs from 'qs';

import {
  type Location,
  useNavigate,
  useNavigationType,
  useLocation,
} from 'react-router-dom';

import { type ParsedFiltersAndSort, useFilterlist } from '@vtaits/react-filterlist';
import type {
  ListState,
} from '@vtaits/filterlist';

import { Page } from '../../../../examples/ui/Page';
import * as api from '../../../../examples/api';

import type {
  User,
  Additional,
} from '../../../../examples/types';

export function InfinityList(): ReactElement | null {
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const location = useLocation();

  const [listState, filterlist] = useFilterlist<
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
    loadItems: async ({
      sort,
      appliedFilters,
      loadedPages,
    }) => {
      const response = await api.loadUsers({
        ...appliedFilters,
        sort: `${sort.param ? `${sort.asc ? '' : '-'}${sort.param}` : ''}`,
        page: loadedPages + 1,
      });

      return {
        items: response.users,
        additional: {
          count: response.count,
        },
      };
    },

    onChangeLoadParams: (newListState: ListState<User, Additional, unknown>): void => {
      const newQuery = qs.stringify({
        ...newListState.appliedFilters,
        sort: newListState.sort.param
          ? `${newListState.sort.asc ? '' : '-'}${newListState.sort.param}`
          : null,
      });

      navigate(`${location.pathname}?${newQuery}`);
    },

    resetFiltersTo: {
      perPage: 10,
    },

    saveFiltersOnResetAll: ['perPage'],

    parseFiltersAndSort: async ({
      location: {
        search,
      },
    }): Promise<ParsedFiltersAndSort> => {
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

  const setAndApplyFilter = useCallback((
    filterName: string,
    value: any,
  ): Promise<void> => {
    if (!filterlist) {
      throw new Error('filterlist is not initialized');
    }

    return filterlist.setAndApplyFilter(
      filterName,
      value,
    );
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
  ): Promise<void> => {
    if (!filterlist) {
      throw new Error('filterlist is not initialized');
    }

    return filterlist.setSorting(
      paramName,
      asc,
    );
  }, [filterlist]);

  const resetAllFilters = useCallback(
    (): Promise<void> => {
      if (!filterlist) {
        throw new Error('filterlist is not initialized');
      }
  
      return filterlist.resetAllFilters();
    },
    [filterlist],
  );

  const reload = useCallback(
    (): Promise<void> => {
      if (!filterlist) {
        throw new Error('filterlist is not initialized');
      }
  
      return filterlist.reload();
    },
    [filterlist],
  );

  const resetFilter = useCallback((
    filterName: string,
  ): Promise<void> => {
    if (!filterlist) {
      throw new Error('filterlist is not initialized');
    }

    return filterlist.resetFilter(
      filterName,
    );
  }, [filterlist]);

  const applyFilter = useCallback((
    filterName: string,
  ): Promise<void> => {
    if (!filterlist) {
      throw new Error('filterlist is not initialized');
    }

    return filterlist.applyFilter(
      filterName,
    );
  }, [filterlist]);

  const loadMore = useCallback(() => {
    if (!filterlist) {
      throw new Error('filterlist is not initialized');
    }

    filterlist.loadMore();
  }, [filterlist]);

  if (!listState) {
    return null;
  }

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
      isInfinity
      loadMore={loadMore}
    />
  );
}
