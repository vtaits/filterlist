import React, {
  memo,
} from 'react';
import styled from 'styled-components';
import type {
  FC,
} from 'react';

import Th from './Th';

import type {
  User,
} from '../types';

import type {
  Sort,
} from '../../packages/filterlist/src/types';

type Props = {
  sort: Sort;
  items: User[];
  setSorting: (param: string) => void;
};

const StyledTable = styled.table({
  width: '100%',
  borderCollapse: 'collapse',
});

const StyledTd = styled.td({
  borderBottom: '2px solid #ccc',
  padding: '5px 10px',
  textAlign: 'left',

  '& + &': {
    borderLeft: '1px solid #ccc',
  },
});

const Table: FC<Props> = memo(({
  sort,
  items,
  setSorting,
}) => (
  <StyledTable>
    <thead>
      <tr>
        <Th
          param="id"
          current={sort.param}
          asc={sort.asc}
          setSorting={setSorting}
        >
          id
        </Th>

        <Th
          param="name"
          current={sort.param}
          asc={sort.asc}
          setSorting={setSorting}
        >
          name
        </Th>

        <Th
          param="email"
          current={sort.param}
          asc={sort.asc}
          setSorting={setSorting}
        >
          email
        </Th>

        <Th
          param="city"
          current={sort.param}
          asc={sort.asc}
          setSorting={setSorting}
        >
          city
        </Th>
      </tr>
    </thead>

    <tbody>
      {
        items.map(({
          id,
          name,
          email,
          city,
        }: User) => (
          <tr key={id}>
            <StyledTd>{id}</StyledTd>
            <StyledTd>{name}</StyledTd>
            <StyledTd>{email}</StyledTd>
            <StyledTd>{city}</StyledTd>
          </tr>
        ))
      }
    </tbody>
  </StyledTable>
));

export default Table;
