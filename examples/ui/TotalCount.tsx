import React from 'react';
import type {
  FC,
} from 'react';
import styled from 'styled-components';

const StyledWrapper = styled.div({
  fontSize: 18,
  lineHeight: 1.2,
});

type Props = {
  count: number;
};

const TotalCount: FC<Props> = ({
  count,
}) => (
  <StyledWrapper>
    Total:
    {' '}
    {count}
  </StyledWrapper>
);

export default TotalCount;
