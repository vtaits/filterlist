import {
  memo,
  useCallback,
} from 'react';
import type {
  ReactElement,
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

type ThProps ={
  param: string;
  current?: string;
  asc?: boolean;
  children?: ReactNode;

  setSorting: (param: string) => void;
};

function ThInner({
  param,

  current,
  asc,

  children,

  setSorting,
}: ThProps): ReactElement {
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
}

ThInner.defaultProps = {
  asc: null,
  current: null,
  children: null,
};

export const Th = memo(ThInner);
