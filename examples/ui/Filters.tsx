import React from 'react';
import type {
  FC,
} from 'react';

import StringFilter from './StringFilter';

type Props = {
  filters: Record<string, any>;
  setFilterValue: (filterName: string, value: any) => void;
  resetFilter: (filterName: string) => Promise<void>;
  applyFilter: (filterName: string) => Promise<void>;
  resetAllFilters: () => Promise<void>;
};

const Filters: FC<Props> = ({
  filters,
  resetAllFilters,
  setFilterValue,
  resetFilter,
  applyFilter,
}) => (
  <>
    <StringFilter
      name="name"
      value={filters.name}
      setFilterValue={setFilterValue}
      resetFilter={resetFilter}
      applyFilter={applyFilter}
    />

    <StringFilter
      name="email"
      value={filters.email}
      setFilterValue={setFilterValue}
      resetFilter={resetFilter}
      applyFilter={applyFilter}
    />

    <StringFilter
      name="city"
      value={filters.city}
      setFilterValue={setFilterValue}
      resetFilter={resetFilter}
      applyFilter={applyFilter}
    />

    <p>
      <button
        type="button"
        onClick={resetAllFilters}
      >
        Reset all filters
      </button>
    </p>
  </>
);

export default Filters;
