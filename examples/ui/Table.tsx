import React, {
  memo,
} from 'react';
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

const Table: FC<Props> = memo(({
  sort,
  items,
  setSorting,
}) => (
  <table>
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
            <td>{id}</td>
            <td>{name}</td>
            <td>{email}</td>
            <td>{city}</td>
          </tr>
        ))
      }
    </tbody>
  </table>
));

export default Table;
