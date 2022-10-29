/* eslint-disable jsx-a11y/label-has-associated-control */

import React, {
  useState,
  useCallback,
  useEffect,
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
import type {
  Location,
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
    canInit,

    loadItems: async ({
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

    alwaysResetFilters: {
      page: 1,
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
    />
  );
}
