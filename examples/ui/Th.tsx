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
