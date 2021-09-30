import React from 'react';
import { storiesOf } from '@storybook/react';

import AllFeatures from './AllFeatures';

storiesOf('filterlist', module)
  .add('all features', () => <AllFeatures />);
