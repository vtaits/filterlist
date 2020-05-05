import React from 'react';
import type {
  FC,
} from 'react';
import { MemoryRouter, Route } from 'react-router-dom';

import List from './List';

const AllFeatures: FC = () => (
  <MemoryRouter>
    <Route component={List} />
  </MemoryRouter>
);

export default AllFeatures;
