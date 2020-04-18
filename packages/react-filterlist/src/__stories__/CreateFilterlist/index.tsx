/* eslint-disable react/no-multi-comp, jsx-a11y/label-has-associated-control */

import React from 'react';
import type {
  FC,
} from 'react';
import qs from 'qs';

import type {
  History,
  Location,
} from 'history';

// eslint-disable-next-line import/no-extraneous-dependencies
import {
  createFilterlist,
} from '@vtaits/react-filterlist';
// eslint-disable-next-line import/no-extraneous-dependencies
import type {
  ListState,
} from '@vtaits/filterlist';

import Page from '../../../../../examples/ui/Page';
import * as api from '../../../../../examples/api';

import type {
  ComponentListActions,
  ParsedFiltersAndSort,
} from '../../types';

type Props = {
  isListInited: boolean;
  listState?: ListState;
  listActions?: ComponentListActions;
};

const List: FC<Props> = ({
  isListInited,
  listState,
  listActions,
}) => {
  if (!isListInited) {
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
      filters={filters}
      sort={sort}
      items={items}
      additional={additional}
      loading={loading}
      setFilterValue={listActions.setFilterValue}
      resetFilter={listActions.resetFilter}
      applyFilter={listActions.applyFilter}
      setAndApplyFilter={listActions.setAndApplyFilter}
      resetAllFilters={listActions.resetAllFilters}
      setSorting={listActions.setSorting}
    />
  );
};

List.defaultProps = {
  listState: null,
  listActions: null,
};

type HistoryAndLocation = {
  history: History;
  location: Location;
};

export default createFilterlist({
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

  onChangeLoadParams: (newListState, { history }): void => {
    const newQuery = qs.stringify({
      ...newListState.appliedFilters,
      sort: newListState.sort.param
        ? `${newListState.sort.asc ? '' : '-'}${newListState.sort.param}`
        : null,
    });

    history.push(`/?${newQuery}`);
  },

  alwaysResetFilters: {
    page: 1,
  },

  resetFiltersTo: {
    perPage: 10,
  },

  saveFiltersOnResetAll: ['perPage'],

  parseFiltersAndSort: ({
    location: {
      search,
    },
  }: HistoryAndLocation): ParsedFiltersAndSort => {
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
      page: parsed.page || 1,
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

  shouldRecount: ({
    history,
    location,
  }: HistoryAndLocation, prevProps: HistoryAndLocation): boolean => history.action === 'POP'
    && location.search !== prevProps.location.search,

  isRecountAsync: true,
})(List);
