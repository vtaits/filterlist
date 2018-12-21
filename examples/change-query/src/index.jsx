import { BrowserRouter, Route } from 'react-router-dom';

import React from 'react';
import { render } from 'react-dom';

import List from './List';

render(
  <BrowserRouter>
    <Route component={List} />
  </BrowserRouter>,
  document.getElementById('app'),
);
