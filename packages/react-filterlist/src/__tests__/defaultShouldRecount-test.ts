import defaultShouldRecount from '../defaultShouldRecount';

test('should be equal', () => {
  expect(defaultShouldRecount(1, 1)).toBe(true);
});

test('should be not equal', () => {
  expect(defaultShouldRecount({}, {})).toBe(false);
});
