import Filterlist from '../Filterlist';
import * as eventTypes from '../eventTypes';
import collectListInitialState from '../collectListInitialState';
import collectOptions from '../collectOptions';

import * as lib from '../index';

test('should export needed modules', () => {
  expect(lib.default).toBe(Filterlist);
  expect(lib.eventTypes).toBe(eventTypes);
  expect(lib.collectListInitialState).toBe(collectListInitialState);
  expect(lib.collectOptions).toBe(collectOptions);
});
