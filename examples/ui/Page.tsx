import React, {
  useCallback,
} from 'react';
import type {
  FC,
} from 'react';
import { Paginator } from '@vtaits/react-paginator';

import Filters from './Filters';
import Table from './Table';
import ItemsPerPage from './ItemsPerPage';
import Preloader from './Preloader';
import TotalCount from './TotalCount';

import type {
  User,
} from '../types';

import type {
  Sort,
} from '../../packages/filterlist/src/types';

type Props = {
  filters: Record<string, any>;
  sort: Sort;
  items: User[];
  additional?: {
    count: number;
  };
  loading: boolean;
  setFilterValue: (filterName: string, value: any) => void;
  resetFilter: (filterName: string) => Promise<void>;
  applyFilter: (filterName: string) => Promise<void>;
  setAndApplyFilter: (filterName: string, value: any) => Promise<void>;
  resetAllFilters: () => Promise<void>;
  setSorting: (param: string) => void;
};

const Page: FC<Props> = ({
  filters,
  sort,
  items,
  additional,
  loading,
  resetAllFilters,
  setFilterValue,
  resetFilter,
  applyFilter,
  setAndApplyFilter,
  setSorting,
}) => {
  const onPageChange = useCallback((page: number): void => {
    setAndApplyFilter('page', page);
  }, [setAndApplyFilter]);

  const perPage = filters.perPage || 10;

  return (
    <>
      <Filters
        filters={filters}
        resetAllFilters={resetAllFilters}
        setFilterValue={setFilterValue}
        resetFilter={resetFilter}
        applyFilter={applyFilter}
      />

      <Table
        items={items}
        sort={sort}
        setSorting={setSorting}
      />

      {
        loading && (
          <Preloader />
        )
      }

      {
        additional && (
          <TotalCount
            count={additional.count}
          />
        )
      }

      <ItemsPerPage
        name="perPage"
        value={filters.perPage}
        setAndApplyFilter={setAndApplyFilter}
      />

      {
        additional && additional.count > 0 && (
          <Paginator
            page={filters.page || 1}
            pageCount={Math.ceil(additional.count / perPage)}
            onPageChange={onPageChange}
          />
        )
      }
    </>
  );
};

Page.defaultProps = {
  additional: null,
};

export default Page;
