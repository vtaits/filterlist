import { storiesOf } from '@storybook/react';
import { MemoryRouter, Route } from 'react-router-dom';

import ChangeQuery from './ChangeQuery';
import CreateFilterlist from './CreateFilterlist';
import UseFilterlist from './UseFilterlist';
import DeferredInit from './DeferredInit';
import InfinityList from './InfinityList';

storiesOf('react-filterlist', module)
  .addDecorator((storyFn) => (
    <MemoryRouter>
      {storyFn()}
    </MemoryRouter>
  ))
  .add('Filterlist', () => (
    <Route
      component={ChangeQuery}
    />
  ))
  .add('createFilterlist', () => (
    <Route
      component={CreateFilterlist}
    />
  ))
  .add('useFilterlist', () => (
    <Route
      component={UseFilterlist}
    />
  ))
  .add('infinity init', () => (
    <Route
      component={InfinityList}
    />
  ));
