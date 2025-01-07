[![NPM](https://img.shields.io/npm/v/@vtaits/qwik-filterlist.svg)](https://www.npmjs.com/package/@vtaits/qwik-filterlist)
![dependencies status](https://img.shields.io/librariesio/release/npm/@vtaits/qwik-filterlist)
[![Types](https://img.shields.io/npm/types/@vtaits/qwik-filterlist.svg)](https://www.npmjs.com/package/@vtaits/qwik-filterlist)

# @vtaits/qwik-filterlist

Qwik wrapper above [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist).

## Installation

```
npm install @vtaits/filterlist @vtaits/qwik-filterlist --save
```

or

```
yarn add @vtaits/filterlist @vtaits/qwik-filterlist
```

## Simple examples

```typescript
import { $, component$ } from "@builder.io/qwik";
import { useFilterlist } from "@vtaits/qwik-filterlist";

const List = component(() => {
  const [listState, filterlist] = useFilterlist({
    loadItems$: $(async () => {
      const response = await fetch('/cars');
      const cars = await response.json();

      return {
        items: cars,
        total: cars.length,
      };
    }),
  });

  const {
    items,
    loading,
    total,
  } = listState.value;

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
});
```

## Api

```typescript
import { useFilterlist } from "@vtaits/qwik-filterlist";

// ...

const [listState, filterlist] = useFilterlist({
  ...options,
  loadItems$,
  parseFiltersAndSort$,
  filtersAndSortData,
  shouldRecount,
  isRecountAsync,
  onChangeLoadParams$,
  canInit,
});
```

`listState` and `filterlist` are `null` during async init or when `canInit` is `true`

### Params

- **options** - options of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist)

- **parseFiltersAndSort$** - QRL function, receives `filtersAndSortData` as first argument, should return params for call `filtersAndSortData` method of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist)

- **filtersAndSortData** - see above

- **shouldRecount** - function, called on every update of component. Receives new `filtersAndSortData` as first argument and old `filtersAndSortData` as second. If returns true, `parseFiltersAndSort` will called. By default checks equality with `===` operator

- **isRecountAsync** - boolean, is `parseFiltersAndSort` async, false by default

- **onChangeLoadParams$** - QRL function, callback of `changeLoadParams` event of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist)

- **canInit** - boolean, filterlist will not be initialized until `canInit` is `true`
