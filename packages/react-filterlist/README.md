[![NPM](https://img.shields.io/npm/v/@vtaits/react-filterlist.svg)](https://www.npmjs.com/package/@vtaits/react-filterlist)

# @vtaits/react-filterlist

React wrapper above [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist).

## Installation

```
npm install @vtaits/filterlist @vtaits/react-filterlist --save
```

or

```
yarn add @vtaits/filterlist @vtaits/react-filterlist
```

Examples are [here](https://github.com/vtaits/react-filterlist/tree/master/examples).

## Simple examples

### With render prop

```javascript
import React from 'react';
import { Filterlist } from '@vtaits/react-filterlist';

/*
 * assuming the API returns something like this:
 *   const json = [
 *     {
 *       id: 1,
 *       brand: 'Audi',
 *       owner: 'Tom',
 *       color: 'yellow',
 *     },
 *     {
 *       id: 2,
 *       brand: 'Mercedes',
 *       owner: 'Henry',
 *       color: 'white',
 *     },
 *     {
 *       id: 3,
 *       brand: 'BMW',
 *       owner: 'Alex',
 *       color: 'black',
 *     },
 *   ]
 */

const loadItems = async () => {
  const response = await fetch('/cars');
  const cars = await response.json();

  return {
    items: cars,
    additional: {
      count: cars.length,
    },
  };
};

const List = () => (
  <Filterlist
    loadItems={loadItems}
  >
    {({
      listState: {
        additional,
        items,
        loading,
      },
    }) => (
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
    )}
  </Filterlist>
);
```

### With HOC

```javascript
import React from 'react';
import { createFilterlist } from '@vtaits/react-filterlist';

const List = ({
  listState: {
    additional,
    items,
    loading,
  },
}) => (
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

const WithFilterlist = createFilterlist({
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
})(List);
```

### With hook

Experimental feature

```javascript
import React from 'react';
import { useFilterlist } from '@vtaits/react-filterlist';

const List = () => {
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

### Component with render prop

```javascript
import { Filterlist } from '@vtaits/react-filterlist';

<Filterlist
  {...options}
  parseFiltersAndSort={parseFiltersAndSort}
  filtersAndSortData={filtersAndSortData}
  shouldRecount={shouldRecount}
  isRecountAsync={isRecountAsync}
  onChangeLoadParams={onChangeLoadParams}
>
  {({
    listState,
    listActions,
    isListInited,
  }) => (
    ...
  )}
</Filterlist>
```

#### Filterlist props

- **options** - options of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist)

- **parseFiltersAndSort** - function, receives `filtersAndSortData` as first argument, should return params for call `filtersAndSortData` method of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist)

- **filtersAndSortData** - see above

- **shouldRecount** - function, called on every update of component. Receives new `filtersAndSortData` as first argument and old `filtersAndSortData` as second. If returns true, `parseFiltersAndSort` will called. By default checks equality with `===` operator

- **isRecountAsync** - boolean, is `parseFiltersAndSort` async, false by default

- **onChangeLoadParams** - function, callback of `changeLoadParams` event of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist)

#### Render props

- **listState** - object, list state of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist)

- **listAction** - object of next methods of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist): `loadItems`, `setFilterValue`, `applyFilter`, `setAndApplyFilter`, `resetFilter`, `setFiltersValues`, `applyFilters`, `setAndApplyFilters`, `resetFilters`, `resetAllFilters`, `setSorting`, `resetSorting`, `insertItem`, `deleteItem`, `updateItem`

- **isListInited** - boolean, can be false on init `Filterlist` with truthy `isRecountAsync`. If false, `listState` and `listAction` are falsy

### HOC

```javascript
import { createFilterlist } from '@vtaits/react-filterlist';

const ChildComponent = ({
  listState,
  listActions,
  isListInited,
  ...restProps
}) => (
  ...
);

createFilterlist({
  {...options}
  loadItems,
  parseFiltersAndSort,
  filtersAndSortData,
  shouldRecount,
  isRecountAsync,
  onChangeLoadParams,
})(ChildComponent);
```

Similarly with `Component with render prop` but there are next differencies:

- `loadItems` receives props as 2nd arugment

- `onChangeLoadParams` receives props as 2nd arugment

- `filtersAndSortData` always equal props

### hook

```javascript
import { useFilterlist } from '@vtaits/react-filterlist';

...

const [listState, filterlist] = useFilterlist({
  ...options,
  canInit,
});
```

Similarly with `Component with render prop` but there are next differencies:

- `listState` and `filterlist` are `null` during async init
- filterlist will not be initialized until `canInit` is `true`
