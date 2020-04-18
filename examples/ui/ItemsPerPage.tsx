import React, {
  useCallback,
  memo,
} from 'react';
import styled from 'styled-components';
import type {
  FC,
  SyntheticEvent,
} from 'react';

const StyledWrapper = styled.div({
  display: 'inline-flex',
  alignItems: 'center',
});

const StyledText = styled.div({
  paddingRight: 20,
});

const StyledSelect = styled.select({
  height: 30,
  borderRadius: 15,
  boxSizing: 'border-box',
  border: '2px solid #999',
  backgroundColor: '#fff',
  outline: 'none',
  paddingLeft: 15,
  paddingRight: 15,
});

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
    <StyledWrapper>
      <StyledText>
        Items per page
      </StyledText>

      <StyledSelect
        value={value}
        onChange={onChange}
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="30">30</option>
      </StyledSelect>
    </StyledWrapper>
  );
});

export default ItemsPerPage;
