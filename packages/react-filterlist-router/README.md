[![NPM](https://img.shields.io/npm/v/@vtaits/react-filterlist-router.svg)](https://www.npmjs.com/package/@vtaits/react-filterlist-router)
![dependencies status](https://img.shields.io/librariesio/release/npm/@vtaits/react-filterlist-router)

# @vtaits/react-filterlist-router@signals

Integration of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist) with [react-router-dom](https://reactrouter.com/en/main)

This version of package uses [TC39 signals](https://github.com/tc39/proposal-signals)

## Installation

```
npm install @vtaits/filterlist@signals @vtaits/react-filterlist@signals @vtaits/react-filterlist-router@signals --save
```

or

```
yarn add @vtaits/filterlist@signals @vtaits/react-filterlist@signals @vtaits/react-filterlist-router@signals
```

or

```
bun add @vtaits/filterlist @vtaits/react-filterlist @vtaits/react-filterlist-router
```

## Simple examples

```tsx
import { useFilterlist } from '@vtaits/react-filterlist';
import { useCreateDataStore } from '@vtaits/react-filterlist-router';
import { useRerender } from "@vtaits/react-signals";

function List() {
  const createDataStore = useCreateDataStore();

  const [_requestParamsSignal, listStateSignal, filterlist] = useFilterlist({
    createDataStore,

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
