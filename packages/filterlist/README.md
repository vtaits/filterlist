[![NPM](https://img.shields.io/npm/v/@vtaits/filterlist.svg)](https://www.npmjs.com/package/@vtaits/filterlist)
![dependencies status](https://img.shields.io/librariesio/release/npm/@vtaits/filterlist)

# @vtaits/filterlist

[Api reference](https://vtaits.github.io/filterlist/modules/Filterlist.html)

Util for creating lists with filters, sotring, paginatinon, endless scroll etc.

## Installation

```
npm install @vtaits/filterlist --save
```

or

```
yarn add @vtaits/filterlist
```

## Api

```ts
import { Filterlist } from '@vtaits/filterlist';

/*
 * assuming the API returns something like this:
 *   const json = {
 *     results: [
 *       {
 *         value: 1,
 *         label: 'Audi',
 *       },
 *       {
 *         value: 2,
 *         label: 'Mercedes',
 *       },
 *       {
 *         value: 3,
 *         label: 'BMW',
 *       },
 *     ],
 *     total: 50,
 *   };
 */

const filterlist = new Filterlist({
  loadItems: async ({
    page,
  }) => {
    const response = await fetch(`/awesome-api-url/?page=${page}`);
    const responseJSON = await response.json();

    return {
      items: responseJSON.results,
      total: responseJSON.total,
    };
  },
});

filterlist.emitter.on(eventTypes.changeListState, (nextListState) => {
  // change ui
  document.getElementById('loader').style.display = nextListState.loading ? 'block' : 'none';
});

// change the page
const changePage = (nextPage: number) => {
  filterlist.setPage(nextPage);
};
```

### Events

`emitter` is the instance of [mitt](https://github.com/developit/mitt).

```ts
import { EventType } from '@vtaits/filterlist';

filterlist.emitter.on(EventType.changeListState, (listState) => {
  // ...
});
```

List of event types:

| Name | When triggered |
| ---- | -------------- |
| loadMore | after load items on init or call `loadMore` method |
| setFilterValue | after call `setFilterValue` method |
| applyFilter | after call `applyFilter` method |
| setAndApplyFilter | after call `setAndApplyFilter` method |
| resetFilter | after call `resetFilter` method |
| setFiltersValues | after call `setFiltersValues` method |
| applyFilters | after call `applyFilters` method |
| setAndApplyFilters | after call `setAndApplyFilters` method |
| setPage | after call `setPage` method |
| setPageSize | after call `setPageSize` method |
| resetFilters | after call `resetFilters` method |
| resetAllFilters | after call `resetAllFilters` method |
| setSorting | after call `setSorting` method |
| resetSorting | after call `resetSorting` method |
| reload | after call `reload` method |
| updateStateAndRequest | after call `updateStateAndRequest` method |
| changeLoadParams | after call some of next methods: `loadMore`, `applyFilter`, `setAndApplyFilter`, `resetFilter`, `applyFilters`, `setAndApplyFilters`, `resetFilters`, `resetAllFilters`, `setSorting`, `resetSorting`, `updateStateAndRequest` |
| insertItem | after call `insertItem` method |
| deleteItem | after call `deleteItem` method |
| updateItem | after call `updateItem` method |
| requestItems | before load items |
| loadItemsSuccess | after successfully load |
| loadItemsError | after load with error |
| changeListState | after every change of list state |
