import React, {
  useCallback,
  memo,
} from 'react';
import styled from 'styled-components';
import type {
  FC,
  SyntheticEvent,
  KeyboardEvent,
} from 'react';

import Button from './Button';

const StyledWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',

  '& + &': {
    marginTop: 20,
  },
});

const StyledName = styled.div({
  width: 100,
  textAlign: 'right',
  paddingRight: 20,
});

const StyledInputWrapper = styled.div({
  flex: 1,
});

const StyledButtonWrapper = styled.div({
  paddingLeft: 20,
});

const StyledInput = styled.input({
  height: 30,
  borderRadius: 15,
  boxSizing: 'border-box',
  width: '100%',
  border: '2px solid #999',
  backgroundColor: '#fff',
  outline: 'none',
  paddingLeft: 15,
  paddingRight: 15,
});

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

  const onKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      applyFilter(name);
    }
  }, [name, applyFilter]);

  const onApplyClick = useCallback(() => {
    applyFilter(name);
  }, [name, applyFilter]);

  const onResetClick = useCallback(() => {
    resetFilter(name);
  }, [name, resetFilter]);

  return (
    <StyledWrapper>
      <StyledName>
        {name}
      </StyledName>

      <StyledInputWrapper>
        <StyledInput
          name={name}
          value={value || ''}
          onChange={onChange}
          onKeyPress={onKeyPress}
        />
      </StyledInputWrapper>

      <StyledButtonWrapper>
        <Button
          type="button"
          onClick={onApplyClick}
        >
          Apply
        </Button>
      </StyledButtonWrapper>

      <StyledButtonWrapper>
        <Button
          buttonType="danger"
          type="button"
          onClick={onResetClick}
        >
          Reset
        </Button>
      </StyledButtonWrapper>
    </StyledWrapper>
  );
});

StringFilter.defaultProps = {
  value: '',
};

export default StringFilter;
