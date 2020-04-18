import React from 'react';
import type {
  ReactNode,
} from 'react';
import { MemoryRouter, Route } from 'react-router-dom';

import List from './List';

export default (): ReactNode => (
  <MemoryRouter>
    <Route component={List} />
  </MemoryRouter>
);
