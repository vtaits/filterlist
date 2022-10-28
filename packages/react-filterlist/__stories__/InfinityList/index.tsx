/* eslint-disable jsx-a11y/label-has-associated-control */

import {
  useCallback,
} from 'react';
import type {
  ReactElement,
} from 'react';

import qs from 'qs';

import {
  useHistory,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';

// eslint-disable-next-line import/no-extraneous-dependencies
import { useFilterlist } from '@vtaits/react-filterlist';
// eslint-disable-next-line import/no-extraneous-dependencies
import type { ParsedFiltersAndSort } from '@vtaits/react-filterlist';
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
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch();

  const [listState, filterlist] = useFilterlist<
    User,
    {
      count: number,
    },
    never,
    {
      history: History;
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

      history.push(`${match.path}?${newQuery}`);
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
      history,
      location,
    },

    shouldRecount: ({
      history: historyParam,
      location,
    }, prevProps) => historyParam.action === 'POP'
      && location.search !== prevProps.location.search,
  });

  const setAndApplyFilter = useCallback((
    filterName: string,
    value: any,
  ): Promise<void> => filterlist.setAndApplyFilter(
    filterName,
    value,
  ), [filterlist]);

  const setFilterValue = useCallback((
    filterName: string,
    value: any,
  ): void => filterlist.setFilterValue(
    filterName,
    value,
  ), [filterlist]);

  const setSorting = useCallback((
    paramName: string,
    asc?: boolean,
  ): Promise<void> => filterlist.setSorting(
    paramName,
    asc,
  ), [filterlist]);

  const resetAllFilters = useCallback(
    (): Promise<void> => filterlist.resetAllFilters(),
    [filterlist],
  );

  const reload = useCallback(
    (): Promise<void> => filterlist.reload(),
    [filterlist],
  );

  const resetFilter = useCallback((
    filterName: string,
  ): Promise<void> => filterlist.resetFilter(
    filterName,
  ), [filterlist]);

  const applyFilter = useCallback((
    filterName: string,
  ): Promise<void> => filterlist.applyFilter(
    filterName,
  ), [filterlist]);

  const loadMore = useCallback(() => {
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
