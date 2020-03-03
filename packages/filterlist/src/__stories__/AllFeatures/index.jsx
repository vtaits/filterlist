import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';

import List from './List';

export default () => (
  <MemoryRouter>
    <Route component={List} />
  </MemoryRouter>
);
