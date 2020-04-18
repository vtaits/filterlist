/* eslint-disable jsx-a11y/label-has-associated-control */

import React, {
  useState,
  useEffect,
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
import Filterlist, { eventTypes } from '@vtaits/filterlist';

import Page from '../../../../../examples/ui/Page';
import * as api from '../../../../../examples/api';

import type {
  ItemsLoader,
  Sort,
} from '../../types';

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
};

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

const List: FC<Props> = ({
  location,
  history,
}) => {
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

  const [listState, setListState] = useState(() => filterlist.getListState());

  const syncListState = useCallback(() => {
    setListState(filterlist.getListState());
  }, []);

  const onChangeListState = useCallback((newListState) => {
    const newQuery = qs.stringify({
      ...newListState.appliedFilters,
      sort: newListState.sort.param
        ? `${newListState.sort.asc ? '' : '-'}${newListState.sort.param}`
        : null,
    });

    history.push(`/?${newQuery}`);
  }, [history]);

  useEffect(() => {
    filterlist.emitter.addListener(eventTypes.changeListState, syncListState);
    filterlist.emitter.addListener(eventTypes.changeLoadParams, onChangeListState);

    return (): void => {
      filterlist.emitter.removeAllListeners(eventTypes.changeListState);
      filterlist.emitter.removeAllListeners(eventTypes.changeLoadParams);
    };
  }, []);

  useEffect(() => {
    if (history.action === 'POP') {
      const stateFromSearch = getStateFromSearch(location.search);

      filterlist.setFiltersAndSorting(stateFromSearch);
    }
  }, [location.search]);

  const setAndApplyFilter = useCallback((
    filterName: string,
    value: any,
  ): Promise<void> => filterlist.setAndApplyFilter(
    filterName,
    value,
  ), []);

  const setFilterValue = useCallback((
    filterName: string,
    value: any,
  ): void => filterlist.setFilterValue(
    filterName,
    value,
  ), []);

  const setSorting = useCallback((
    paramName: string,
    asc?: boolean,
  ): Promise<void> => filterlist.setSorting(
    paramName,
    asc,
  ), []);

  const resetAllFilters = useCallback((): Promise<void> => filterlist.resetAllFilters(), []);

  const resetFilter = useCallback((
    filterName: string,
  ): Promise<void> => filterlist.resetFilter(
    filterName,
  ), []);

  const applyFilter = useCallback((
    filterName: string,
  ): Promise<void> => filterlist.applyFilter(
    filterName,
  ), []);

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
