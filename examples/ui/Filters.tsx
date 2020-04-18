import React from 'react';
import type {
  FC,
} from 'react';
import styled from 'styled-components';

import StringFilter from './StringFilter';
import Button from './Button';

const StyledWrapper = styled.div({
  backgroundColor: '#EEE',
  borderRadius: 10,
  padding: 20,
  marginBottom: 30,
});

const StyledFiltersWrapper = styled.div({
  marginBottom: 20,
});

const StyledResetWrapper = styled.div({
  textAlign: 'right',
});

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
  <StyledWrapper>
    <StyledFiltersWrapper>
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
    </StyledFiltersWrapper>

    <StyledResetWrapper>
      <Button
        type="button"
        buttonType="danger"
        onClick={resetAllFilters}
      >
        Reset all filters
      </Button>
    </StyledResetWrapper>
  </StyledWrapper>
);

export default Filters;
