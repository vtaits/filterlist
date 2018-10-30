import collectOptions, { defaultOptions } from '../collectOptions';

test('should return defaultOptions', () => {
  expect(collectOptions({})).toEqual(defaultOptions);
});

test('should set filters for resetting', () => {
  const alwaysResetFilters = {
    filter1: 'value1',
    filter2: 'value2',
  };

  const options = collectOptions({
    alwaysResetFilters,
  });

  expect(options.alwaysResetFilters).toEqual(alwaysResetFilters);
});

test('should set isDefaultSortAsc true', () => {
  const options = collectOptions({
    isDefaultSortAsc: true,
  });

  expect(options.isDefaultSortAsc).toEqual(true);
});

test('should set isDefaultSortAsc false', () => {
  const options = collectOptions({
    isDefaultSortAsc: true,
  });

  expect(options.isDefaultSortAsc).toEqual(true);
});

test('should no set isDefaultSortAsc (true by default)', () => {
  const options = collectOptions({
  });

  expect(options.isDefaultSortAsc).toEqual(true);
});

test('should set saveFiltersOnResetAll', () => {
  const options = collectOptions({
    saveFiltersOnResetAll: ['filter1', 'filter2'],
  });

  expect(options.saveFiltersOnResetAll).toEqual(['filter1', 'filter2']);
});

test('should set saveItemsWhileLoad', () => {
  const options = collectOptions({
    saveItemsWhileLoad: true,
  });

  expect(options.saveItemsWhileLoad).toEqual(true);
});

test('should no set saveItemsWhileLoad (false by default)', () => {
  const options = collectOptions({
  });

  expect(options.saveItemsWhileLoad).toEqual(false);
});

test('should set autoload', () => {
  const options = collectOptions({
    autoload: false,
  });

  expect(options.autoload).toEqual(false);
});

test('should no set autoload (true by default)', () => {
  const options = collectOptions({
  });

  expect(options.autoload).toEqual(true);
});
