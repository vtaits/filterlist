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
  value?: string;
  setFilterValue: (filterName: string, value: any) => void;
  resetFilter: (filterName: string) => Promise<void>;
  applyFilter: (filterName: string) => Promise<void>;
};

const StringFilter: FC<Props> = memo(({
  name,
  value,
  setFilterValue,
  resetFilter,
  applyFilter,
}) => {
  const onChange = useCallback((event: SyntheticEvent) => {
    setFilterValue(name, (event.target as HTMLInputElement).value);
  }, [name, setFilterValue]);

  const onApplyClick = useCallback(() => {
    applyFilter(name);
  }, [name, applyFilter]);

  const onResetClick = useCallback(() => {
    resetFilter(name);
  }, [name, resetFilter]);

  return (
    <p>
      {name}
      :
      {' '}
      <input
        name={name}
        value={value || ''}
        onChange={onChange}
      />
      {' '}
      <button
        type="button"
        onClick={onApplyClick}
      >
        Apply
      </button>
      {' '}
      <button
        type="button"
        onClick={onResetClick}
      >
        Reset
      </button>
    </p>
  );
});

StringFilter.defaultProps = {
  value: '',
};

export default StringFilter;
