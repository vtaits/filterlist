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
    // currently applied filters
    appliedFilters,
    // current page
    page,
    // number of items on one page
    pageSize,
    // sorting state
    sort: {
      // sorting parameter
      param,
      // asc or desc (boolean)
      asc,
    },
  }, {
    items,
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

// load next chunk of   for the infinite list
filterlist.loadMore();

// change runtime value of filter (e.g. on keyboard input)
filterlist.setFilterValue('foo', 'bar');

// apply runtime value and reload the list
filterlist.applyFilter('foo');

// change value of the filter and reload the list
filterlist.setAndApplyFilter('foo', 'bar');

// reset value of the filter and reload the list
filterlist.resetFilter('foo');

// bulk change values of filters (e.g. on keyboard input)
filterlist.setFiltersValues({
  foo: 'value',
  bar: ['baz', 'qux'],
}));

// bulk apply runtime values and reload the list
filterlist.applyFilters(['foo', 'bar']);

// bulk change values of filters and reload the list
filterlist.setAndApplyFilters({
  foo: 'value',
  bar: ['baz', 'qux'],
});

// bulk change empty values of filters and reload the list
filterlist.setAndApplyEmptyFilters({
  foo: 'value',
  bar: ['baz', 'qux'],
});

// bulk reset values of filters and reload the list
filterlist.resetFilters(['foo', 'bar']);

// reset all setted filters and reload the list
filterlist.resetAllFilters();

// set sorting state and reload the list
filterlist.setSorting('id');
// asc
filterlist.setSorting('id', true);
// desc
filterlist.setSorting('id', false);

// reload sorting state and reload the list
filterlist.resetSorting();

// reload current list
filterlist.reload();

// change current page reload the list (for pagination bases lists)
filterlist.setPage(3);

// change current page reload the list
filterlist.setPageSize(nextPage);

const {
  // currently applied filters
  appliedFilters,
  // current page
  page,
  // number of items on one page
  pageSize,
  // sorting state
  sort: {
    // sorting parameter
    param,
    // asc or desc (boolean)
    asc,
  },
} = filterlist.getRequestParams();

const {
  // runtime values of filters
  filters,
  // is the list currently loading
  loading,
  // list of loading items
  items,
} = filterlist.getListState();
```

### Filterlist parameters

```typescript
const filterlist = new Filterlist({
	// Create data store to store parameters such as currently applied filtes, sorting state, current page and number of items on one page
	createDataStore,
	// function that loads items into the list
	loadItems,
	// initially defined list of items
	items,
	// initial sorting
	sort,
	// filters and their values that applied by default
	appliedFilters,
	// request items on init
	autoload,
	// debounce timeout to prevent extra requests
	debounceTimeout,
	// default `asc` param after change sorting column
	isDefaultSortAsc,
	// filters and their values that will be set after filter reset
	resetFiltersTo,
	// by default items are cleared if filters or sorting changed. If `saveItemsWhileLoad` is `true`, previous list items are saved while load request is pending
	saveItemsWhileLoad,
	// initial page
	page,
	// initial size of the page
	pageSize,
	// timeout to refresh the list
	refreshTimeout,
	// total count of items
	total,
});
```

### Navigator url sync

You can use `createDataStore` parameter

There's an example of synchronization using `window.history` and `window.location` here:

```typescript
import {
	createEmitter,
	createStringBasedDataStore,
} from "@vtaits/filterlist/datastore/string";

const historyEmitter = createEmitter();

window.addEventListener("popstate", () => {
	historyEmitter.emit();
});

function createDataStore() {
  return createStringBasedDataStore(
    () => window.location.search,
    (nextSearch) => {
      window.history.pushState('', '', `${window.location.pathname}?${nextSearch}`);
    },
    historyEmitter,
    options,
  );
};

const filterlist = new Filterlist({
  createDataStore,
  // ...
})
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
| setAndApplyEmptyFilters | after call `setAndApplyEmptyFilters` method |
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
