import React from 'react';
import type {
  FC,
} from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { definition as faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';

const StyledWrapper = styled.div({
  display: 'flex',
  height: 200,
  fontSize: 24,
  color: '#999',
  alignItems: 'center',
  justifyContent: 'center',
});

const Preloader: FC = () => (
  <StyledWrapper>
    <FontAwesomeIcon
      icon={faSpinner}
      pulse
      size="2x"
    />
  </StyledWrapper>
);

export default Preloader;
