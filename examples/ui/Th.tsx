import React, {
  memo,
  useCallback,
} from 'react';
import type {
  FC,
  ReactNode,
} from 'react';

import styled from 'styled-components';

const StyledTh = styled.th({
  cursor: 'pointer',
  color: 'blue',
  borderBottom: '2px solid #ccc',
  padding: '5px 10px',
  textAlign: 'left',
  outline: 'none',

  '&:hover': {
    textDecoration: 'underline',
  },

  '&:active': {
    opacity: 0.75,
  },

  '& + &': {
    borderLeft: '1px solid #ccc',
  },
});

type Props ={
  param: string;
  current?: string;
  asc?: boolean;
  children?: ReactNode;

  setSorting: (param: string) => void;
};

const Th:FC<Props> = memo(({
  param,

  current,
  asc,

  children,

  setSorting,
}) => {
  const onClick = useCallback((): void => {
    setSorting(param);
  }, [param, setSorting]);

  return (
    <StyledTh
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {children}

      {
        param === current && (
          asc ? '↓' : '↑'
        )
      }
    </StyledTh>
  );
});

Th.defaultProps = {
  asc: null,
  current: null,
  children: null,
};

export default Th;
