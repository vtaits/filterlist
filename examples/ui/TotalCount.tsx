import React from 'react';
import type {
  FC,
} from 'react';

type Props = {
  count: number;
};

const TotalCount: FC<Props> = ({
  count,
}) => (
  <h4>
    Total:
    {' '}
    {count}
  </h4>
);

export default TotalCount;
