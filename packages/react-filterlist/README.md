[![NPM](https://img.shields.io/npm/v/@vtaits/react-filterlist.svg)](https://www.npmjs.com/package/@vtaits/react-filterlist)
![dependencies status](https://img.shields.io/librariesio/release/npm/@vtaits/react-filterlist)

# @vtaits/react-filterlist@signals

React wrapper above [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist).

This version of package uses [TC39 signals](https://github.com/tc39/proposal-signals)

## Sandbox examples

- Table with filters: [demo](https://kto5e.csb.app/), [source](https://codesandbox.io/s/example-kto5e)

## Installation

```
npm install @vtaits/filterlist@signals @vtaits/react-filterlist@signals --save
```

or

```
yarn add @vtaits/filterlist@signals @vtaits/react-filterlist@signals
```

or

```
bun add @vtaits/filterlist @vtaits/react-filterlist
```

## Simple examples

```tsx
import { useFilterlist } from '@vtaits/react-filterlist';
import { useRerender } from "@vtaits/react-signals";

function List() {
  const [_requestParamsSignal, listStateSignal, filterlist] = useFilterlist({
    loadItems: async () => {
      const response = await fetch('/cars');
      const cars = await response.json();

      return {
        items: cars,
				total: cars.length,
      };
    },
  });

  useRerender([listStateSignal]);

  const listState = listStateSignal.get();

  if (!listState) {
    return null;
  }

  const {
    items,
    loading,
    total,
  } = listState;

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>brand</th>
            <th>owner</th>
            <th>color</th>
          </tr>
        </thead>

        <tbody>
          {
            items.map(({
              id,
              brand,
              owner,
              color,
            }) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{brand}</td>
                <td>{owner}</td>
                <td>{color}</td>
              </tr>
            ))
          }
        </tbody>
      </table>

      {
        typeof total === 'number' && (
          <h4>
            Total: {total}
          </h4>
        )
      }

      {
        loading && (
          <h3>Loading...</h3>
        )
      }
    </div>
  );
};
```

## Api

### useFilterlist

```typescript
import { useFilterlist } from '@vtaits/react-filterlist';

// ...

const [requestParamsSignal, listStateSignal, filterlist] = useFilterlist({
  ...options,
  parseFiltersAndSort,
  filtersAndSortData,
  shouldRecount,
  isRecountAsync,
  onChangeLoadParams,
  canInit,
});
```

The values of `listStateSignal` and `filterlistSignal` are `null` during async init or when `canInit` is `true`

#### Params

- **options** - options of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist)

- **parseFiltersAndSort** - function, receives `filtersAndSortData` as first argument, should return params for call `filtersAndSortData` method of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist)

- **filtersAndSortData** - see above

- **shouldRecount** - function, called on every update of component. Receives new `filtersAndSortData` as first argument and old `filtersAndSortData` as second. If returns true, `parseFiltersAndSort` will called. By default checks equality with `===` operator

- **isRecountAsync** - boolean, is `parseFiltersAndSort` async, false by default

- **onChangeLoadParams** - function, callback of `changeLoadParams` event of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist)

- **canInit** - boolean, filterlist will not be initialized until `canInit` is `true`

### useFilter

The hook that binds filterlist methods to the filter and receives its value by name

```typescript
import { useFilterlist, useFilter } from '@vtaits/react-filterlist';

// ...

const [requestParamsSignal, listStateSignal, filterlist] = useFilterlist(options);

const {
  setFilterValue,
  setAndApplyFilter,
  applyFilter,
  resetFilter,
  valueSignal,
  appliedValueSignal,
} = useFilter(requestParamsSignal, listStateSignal, filterlist, 'filter_name');

setFilterValue('next_value');
setAndApplyFilter('next_value');
applyFilter();
resetFilter();
```

### useBoundFilter

`useFilter` that automatically bound to the filterlist

```typescript
import { useFilterlist } from '@vtaits/react-filterlist';

// ...

const [listStateSignal, filterlistSignal, {
  useBoundFilter,
}] = useFilterlist(options);

const {
  setFilterValue,
  setAndApplyFilter,
  applyFilter,
  resetFilter,
  valueSignal,
  appliedValueSignal,
} = useBoundFilter('filter_name');

setFilterValue('next_value');
setAndApplyFilter('next_value');
applyFilter();
resetFilter();
```

### Navigator url sync

You can use one of the next integrations:

[react-router v6](https://github.com/vtaits/filterlist/tree/feature/signals/packages/react-filterlist-router-6)

[react-router v5](https://github.com/vtaits/filterlist/tree/feature/signals/packages/react-filterlist-router-5)

Or use `createDataStore` parameter as described in the [core](https://github.com/vtaits/filterlist/tree/feature/signals/packages/filterlist) package
