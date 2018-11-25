[![NPM](https://img.shields.io/npm/v/@vtaits/filterlist.svg)](https://www.npmjs.com/package/@vtaits/filterlist)

# @vtaits/filterlist

Util for creating lists with filters, sotring, paginatinon, endless scroll etc.

## Installation

```
npm install @vtaits/filterlist --save
```

or

```
yarn add @vtaits/filterlist
```

This package requiers next polyfills:

 - Promise
 - regeneratorRuntime

Examples are [here](https://github.com/vtaits/filterlist/tree/master/examples).

## Api

```
import Filterlist from '@vtaits/filterlist';

const filterlist = new Filterlist({
  ...params,
})(List)
```

### Params

- **loadItems** - **required**, async Function, should return next object:
  ```
  {
    items: [...],
    additional: {...}
  }
  ```

  - items is array of loaded data

  - additional is additional info (total count etc.), can be null if not needed)

  Can throw `LoadListError` with Object `{ error, additional }`. Error can be null if not needed.

- **items** - Array, items setted by default

- **additional** - any, Additional info (total count etc.) setted by default

- **sort** - Object , default sorting state of the list, should be

  ```
  {
    param /* string, column id */,
    asc /* boolean, asc or desc */,
  }
  ```

- **isDefaultSortAsc** - Boolean, default `asc` param after change sorting column (true by default)

- **appliedFilters** - Object, filters and their values that applied by default. Should be { filterName1: filterValue, filter2Name: filter2Value, ... }

- **initialFilters** - Object, filters and their values that sets after filter reset. Should be { filterName1: filterValue, filter2Name: filter2Value, ... }

- **alwaysResetFilters** - Object, filters and their values that sets after every filters or sorting change. Should be { filterName1: filterValue, filter2Name: filter2Value, ... }

- **saveFiltersOnResetAll** - Array, filters names that not reset after `resetAllFilters` call. Should be [filterName1, filter2Name, ...]

- **saveItemsWhileLoad** - Boolean, by default items are cleared if filters or sorting changed. If `saveItemsWhileLoad` is true, previous list items are saved while load request is pending

- **autoload** - Boolean, configure initial loading process

### List state

```
const listState = filterlist.getListState();
```

| Param | Description | Type |
| ----- | ----------- | ---- |
| loading | is list loading in this moment | Boolean |
| items | loaded items | Array |
| additional | additional info that can be recieved together with items | any |
| error | error that can be received if list not loaded | any |
| sort | sorting state of the list | Object { param, asc } |
| filters | current filters state on page (intermediate inputs values etc.) | Object { filterName1: filterValue, filter2Name: filter2Value, ... } |
| appliedFilters | applied filters | Object { filterName1: filterValue, filter2Name: filter2Value, ... } |

### Methods

| Property | Arguments | Description |
| -------- | --------- | ----------- |
| loadItems | | loads more items to page |
| setFilterValue | filterName, value | sets filter intermediate value |
| applyFilter | filterName | applies filter intermediate value, clears list and loads items |
| setAndApplyFilter | filterName, value | sets filter values, applies that, clears list and loads items |
| resetFilter | filterName | resets filter value to it initial value, applies that, clears list and loads items |
| setFiltersValues | Object { filterName1: filterValue, filter2Name: filter2Value, ... } | sets multiple filters intermediate values |
| applyFilters | Array [filterName1, filter2Name, ...] | applies multiple filters intermediate values, clears list and loads items |
| setAndApplyFilters | Object { filterName1: filterValue, filter2Name: filter2Value, ... } | sets multiple filters values, applies them, clears list and loads items |
| resetFilters | Array [filterName1, filter2Name, ...] | resets filters values to them initial values, applies them, clears list and loads items |
| resetAllFilters | | resets all filters (without `saveFiltersOnResetAll`) values to them initial values, applies them, clears list and loads items |
| setSorting | param, asc | sets sorting column. If asc defined and Boolean, sets it. Otherwise, if this column differs from previous sorting column, asc will be setted with `isDefaultSortAsc` param from decorator. Otherwise, it will be reverse `asc` param from previous state. |
| resetSorting | | resets sorting. Sort param will be setted with null, asc will be setted with `isDefaultSortAsc` param from decorator. |
| deleteItem | index, additional | delete item with specified index from list. If `additional` defined, sets it. |
| updateItem | index, item, additional | update item by specified index. If `additional` defined, sets it. |
| setFiltersAndSorting | { filters, appliedFilters, sort } | sets filters, applied filters and sort and loads items |

### Events

`Filterlist` extends [EventEmitter](https://github.com/facebook/emitter). Every event calls calback with current list state as first argument. E.g.

```
import { eventTypes } from '@vtaits/filterlist';

filterlist.addListener(eventTypes.changeListState, (listState) => {
  ...
});
```

List of event types:

| Name | When triggered |
| ---- | -------------- |
| loadItems | after load items on init or call `loadItems` method |
| setFilterValue | after call `setFilterValue` method |
| applyFilter | after call `applyFilter` method |
| setAndApplyFilter | after call `setAndApplyFilter` method |
| resetFilter | after call `resetFilter` method |
| setFiltersValues | after call `setFiltersValues` method |
| applyFilters | after call `applyFilters` method |
| setAndApplyFilters | after call `setAndApplyFilters` method |
| resetFilters | after call `resetFilters` method |
| resetAllFilters | after call `resetAllFilters` method |
| setSorting | after call `setSorting` method |
| resetSorting | after call `resetSorting` method |
| setFiltersAndSorting | after call `setFiltersAndSorting` method |
| changeLoadParams | after call some of next methods: `loadItems`, `applyFilter`, `setAndApplyFilter`, `resetFilter`, `applyFilters`, `setAndApplyFilters`, `resetFilters`, `resetAllFilters`, `setSorting`, `resetSorting`, `setFiltersAndSorting` |
| insertItem | after call `insertItem` method |
| deleteItem | after call `deleteItem` method |
| updateItem | after call `updateItem` method |
| requestItems | before load items |
| loadItemsSuccess | after successfully load |
| loadItemsError | after load with error |
| changeListState | after every change of list state |
