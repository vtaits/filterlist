[![NPM](https://img.shields.io/npm/v/@vtaits/react-filterlist-router-5.svg)](https://www.npmjs.com/package/@vtaits/react-filterlist-router-5)
![dependencies status](https://img.shields.io/librariesio/release/npm/@vtaits/react-filterlist-router-5)

# @vtaits/react-filterlist-router-5

Integration of [@vtaits/filterlist](https://www.npmjs.com/package/@vtaits/filterlist) with [react-router-dom v5](https://v5.reactrouter.com/)

## Installation

```
npm install @vtaits/filterlist @vtaits/react-filterlist @vtaits/react-filterlist-router-5 --save
```

or

```
yarn add @vtaits/filterlist @vtaits/react-filterlist @vtaits/react-filterlist-router-5
```

or

```
bun add @vtaits/filterlist @vtaits/react-filterlist @vtaits/react-filterlist-router-5
```

## Simple examples

```typescript
import { useFilterlist } from '@vtaits/react-filterlist';
import { useCreateDataStore } from '@vtaits/react-filterlist-router-5';

function List() {
  const createDataStore = useCreateDataStore();

  const [requestParams, listState, filterlist] = useFilterlist({
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
