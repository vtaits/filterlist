import React, {
  useCallback,
  memo,
} from 'react';
import type {
  FC,
  SyntheticEvent,
} from 'react';

type Props = {
  name: string;
  value: number;
  setAndApplyFilter: (filterName: string, value: any) => void;
};

const ItemsPerPage: FC<Props> = memo(({
  name,
  value,
  setAndApplyFilter,
}) => {
  const onChange = useCallback((event: SyntheticEvent) => {
    setAndApplyFilter(name, Number((event.target as HTMLInputElement).value));
  }, [name, setAndApplyFilter]);

  return (
    <p>
      Items per page:
      {' '}
      <select
        value={value}
        onChange={onChange}
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="30">30</option>
      </select>
    </p>
  );
});

export default ItemsPerPage;
