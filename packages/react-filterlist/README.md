[![NPM](https://img.shields.io/npm/v/@vtaits/react-filterlist.svg)](https://www.npmjs.com/package/@vtaits/react-filterlist)
![dependencies status](https://img.shields.io/librariesio/release/npm/@vtaits/react-filterlist)
[![Types](https://img.shields.io/npm/types/@vtaits/react-filterlist.svg)](https://www.npmjs.com/package/@vtaits/react-filterlist)

# @vtaits/react-filterlist

React wrapper above [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist).

## Sandbox examples

- Table with filters: [demo](https://kto5e.csb.app/), [source](https://codesandbox.io/s/example-kto5e)

## Installation

```
npm install @vtaits/filterlist @vtaits/react-filterlist --save
```

or

```
yarn add @vtaits/filterlist @vtaits/react-filterlist
```

## Simple examples

```typescript
import { useFilterlist } from '@vtaits/react-filterlist';

function List() {
  const [listState, filterlist] = useFilterlist({
    loadItems: async () => {
      const response = await fetch('/cars');
      const cars = await response.json();

      return {
        items: cars,
				total: cars.length,
      };
    },
  });

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
              <tr key={ id }>
                <td>{ id }</td>
                <td>{ brand }</td>
                <td>{ owner }</td>
                <td>{ color }</td>
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

const [listState, filterlist] = useFilterlist({
  ...options,
  parseFiltersAndSort,
  filtersAndSortData,
  shouldRecount,
  isRecountAsync,
  onChangeLoadParams,
  canInit,
});
```

`listState` and `filterlist` are `null` during async init or when `canInit` is `true`

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

const [listState, filterlist] = useFilterlist(options);

const {
  setFilterValue,
  setAndApplyFilter,
  applyFilter,
  resetFilter,
  value,
  appliedValue,
} = useFilter(listState, filterlist, 'filter_name');

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

const [listState, filterlist, {
  useBoundFilter,
}] = useFilterlist(options);

const {
  setFilterValue,
  setAndApplyFilter,
  applyFilter,
  resetFilter,
  value,
  appliedValue,
} = useBoundFilter('filter_name');

setFilterValue('next_value');
setAndApplyFilter('next_value');
applyFilter();
resetFilter();
```
