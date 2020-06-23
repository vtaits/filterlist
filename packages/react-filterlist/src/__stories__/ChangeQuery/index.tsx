import React, {
  useCallback,
} from 'react';
import type {
  FC,
  ReactNode,
} from 'react';
import qs from 'qs';

import type {
  History,
  Location,
} from 'history';

// eslint-disable-next-line import/no-extraneous-dependencies
import { Filterlist } from '@vtaits/react-filterlist';
// eslint-disable-next-line import/no-extraneous-dependencies
import type {
  ItemsLoader,
  ListState,
} from '@vtaits/filterlist';

import Page from '../../../../../examples/ui/Page';
import * as api from '../../../../../examples/api';
import {
  ParseFiltersAndSort,
} from '../../types';

const getStateFromProps: ParseFiltersAndSort = async ({
  location: {
    search,
  },
}) => {
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

const shouldRecount = ({
  history,
  location,
}, prevProps): boolean => history.action === 'POP'
  && location.search !== prevProps.location.search;

const loadItems: ItemsLoader = async ({
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

type Props = {
  history: History;
  location: Location;
};

const WithFilterlist: FC<Props> = (props) => {
  const {
    history,
  } = props;

  const onChangeLoadParams = useCallback((newListState: ListState): void => {
    const newQuery = qs.stringify({
      ...newListState.appliedFilters,
      sort: newListState.sort.param
        ? `${newListState.sort.asc ? '' : '-'}${newListState.sort.param}`
        : null,
    });

    history.push(`/?${newQuery}`);
  }, [history]);

  return (
    <Filterlist
      onChangeLoadParams={onChangeLoadParams}
      alwaysResetFilters={{
        page: 1,
      }}
      resetFiltersTo={{
        perPage: 10,
      }}
      saveFiltersOnResetAll={['perPage']}
      loadItems={loadItems}
      parseFiltersAndSort={getStateFromProps}
      shouldRecount={shouldRecount}
      filtersAndSortData={props}
      isRecountAsync
    >
      {({
        isListInited,
        listState,
        listActions,
      }): ReactNode => {
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
            listState={listState}
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
      }}
    </Filterlist>
  );
};

export default WithFilterlist;
