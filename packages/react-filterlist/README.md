[![NPM](https://img.shields.io/npm/v/@vtaits/react-filterlist.svg)](https://www.npmjs.com/package/@vtaits/react-filterlist)
[![dependencies status](https://david-dm.org/vtaits/filterlist/status.svg?path=packages/react-filterlist)](https://david-dm.org/vtaits/filterlist?path=packages/react-filterlist)
[![devDependencies status](https://david-dm.org/vtaits/filterlist/dev-status.svg?path=packages/react-filterlist)](https://david-dm.org/vtaits/filterlist?path=packages/react-filterlist&type=dev)
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

```javascript
import { useFilterlist } from '@vtaits/react-filterlist';

function List() {
  const [listState, filterlist] = useFilterlist({
    loadItems: async () => {
      const response = await fetch('/cars');
      const cars = await response.json();

      return {
        items: cars,
        additional: {
          count: cars.length,
        },
      };
    },
  });

  const {
    additional,
    items,
    loading,
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
        additional && (
          <h4>
            Total: { additional.count }
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

```javascript
import { useFilterlist } from '@vtaits/react-filterlist';

...

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

### Params

- **options** - options of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist)

- **parseFiltersAndSort** - function, receives `filtersAndSortData` as first argument, should return params for call `filtersAndSortData` method of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist)

- **filtersAndSortData** - see above

- **shouldRecount** - function, called on every update of component. Receives new `filtersAndSortData` as first argument and old `filtersAndSortData` as second. If returns true, `parseFiltersAndSort` will called. By default checks equality with `===` operator

- **isRecountAsync** - boolean, is `parseFiltersAndSort` async, false by default

- **onChangeLoadParams** - function, callback of `changeLoadParams` event of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist)

- **canInit** - boolean, filterlist will not be initialized until `canInit` is `true`

