/* eslint-disable jsx-a11y/label-has-associated-control */

import React, {
  useCallback,
} from 'react';
import type {
  FC,
} from 'react';
import qs from 'qs';

import type {
  History,
  Location,
} from 'history';

// eslint-disable-next-line import/no-extraneous-dependencies
import { useFilterlist } from '@vtaits/react-filterlist';
// eslint-disable-next-line import/no-extraneous-dependencies
import type { ParsedFiltersAndSort } from '@vtaits/react-filterlist';
import type {
  ListState,
} from '@vtaits/filterlist';

import Page from '../../../../../examples/ui/Page';
import * as api from '../../../../../examples/api';

type Props = {
  history: History;
  location: Location;

  match: {
    path: string;
  };
};

const List: FC<Props> = (props) => {
  const {
    history,
    match,
  } = props;

  const [listState, filterlist] = useFilterlist({
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

    onChangeLoadParams: (newListState: ListState): void => {
      const newQuery = qs.stringify({
        ...newListState.appliedFilters,
        sort: newListState.sort.param
          ? `${newListState.sort.asc ? '' : '-'}${newListState.sort.param}`
          : null,
      });

      history.push(`${match.path}?${newQuery}`);
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
    }: Props): Promise<ParsedFiltersAndSort> => {
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

    filtersAndSortData: props,

    shouldRecount: ({
      history: historyParam,
      location,
    }: Props, prevProps: Props) => historyParam.action === 'POP'
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
  } = listState;

  return (
    <Page
      listState={listState}
      filters={filters}
      sort={sort}
      items={items}
      additional={additional}
      loading={loading}
      setFilterValue={setFilterValue}
      resetFilter={resetFilter}
      applyFilter={applyFilter}
      setAndApplyFilter={setAndApplyFilter}
      resetAllFilters={resetAllFilters}
      setSorting={setSorting}
    />
  );
};

export default List;
